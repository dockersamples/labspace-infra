import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import Spinner from "react-bootstrap/Spinner";

import { parse } from "yaml";
import { LogProcessor } from "./logProcessor.js";

const CATALOGS = [
  "https://raw.githubusercontent.com/dockersamples/awesome-labspaces/refs/heads/main/catalog.yaml",
];

const DockerContext = createContext();

export function DockerContextProvider({ children }) {
  const [labspaces, setLabspaces] = useState(null);
  const [additionalLabspaces, setAdditionalLabspaces] = useState(
    localStorage.getItem("custom-labspaces")
      ? JSON.parse(localStorage.getItem("custom-labspaces"))
      : [],
  );

  const [hasLabspace, setHasLabspace] = useState(false);
  const [runningLabspace, setRunningLabspace] = useState(null);
  const [startingLabspace, setStartingLabspace] = useState(null);
  const [stoppingLabspace, setStoppingLabspace] = useState(false);
  const [launchLog, setLaunchLog] = useState("");
  const [forceRefreshCount, setForceRefreshCount] = useState(0);

  const logProcessor = useMemo(() => new LogProcessor(), []);

  useEffect(() => {
    Promise.all(
      CATALOGS.map((url) =>
        fetch(url)
          .then((res) => res.text())
          .then((text) => parse(text))
          .then((data) => data.labspaces || []),
      ),
    ).then((results) => {
      setLabspaces(results.flat());
    });
  }, []);

  useEffect(() => {
    function checkIfRunning() {
      ddClient.docker.cli
        .exec("compose", ["-p", "labspace", "ps", "-a"])
        .then(({ stdout }) => {
          const hasRunningLabspace = stdout.trim().split("\n").length > 1;
          setHasLabspace(hasRunningLabspace);
        });
    }

    checkIfRunning();
    const interval = setInterval(checkIfRunning, 5000);
    return () => clearInterval(interval);
  }, [setHasLabspace]);

  useEffect(() => {
    if (!hasLabspace) {
      setRunningLabspace(null);
      return;
    }

    ddClient.docker.cli
      .exec("compose", [
        "-p",
        "labspace",
        "exec",
        "interface",
        "cat",
        "/project/labspace.yaml",
      ])
      .then(({ stdout }) => {
        const labspaceDetails = parse(stdout);
        setRunningLabspace(labspaceDetails);
      });
  }, [hasLabspace, setRunningLabspace, forceRefreshCount]);

  const stopLabspace = useCallback(() => {
    setStoppingLabspace(true);
    ddClient.docker.cli
      .exec("compose", ["-p", "labspace", "down", "--volumes"])
      .then(() => {
        setHasLabspace(false);
        setStoppingLabspace(false);
      });
  }, [setHasLabspace, setStoppingLabspace]);

  const startLabspace = useCallback(
    (location) => {
      console.log(`Starting Labspace with location ${location}`);
      logProcessor.reset();
      setLaunchLog("");
      setStartingLabspace(location);

      ddClient.docker.cli.exec(
        "compose",
        ["-f", `oci://${location}`, "-p", "labspace", "up", "-d", "-y"],
        {
          stream: {
            onOutput(data) {
              const newData = data.stdout ? data.stdout : data.stderr;
              let result;
              newData.split("\n").forEach((line) => {
                if (line.trim() === "") return;

                result = logProcessor.processLine(line.trim());
              });
              setLaunchLog(result);
            },
            onClose(exitCode) {
              setHasLabspace(true);
              setStartingLabspace(null);
              setForceRefreshCount((c) => c + 1);
            },
          },
        },
      );
    },
    [setHasLabspace, setStartingLabspace, setForceRefreshCount, setLaunchLog],
  );

  const addLabspace = useCallback(
    (title, publishedRepo) => {
      const newLabspace = { title, publishedRepo };
      setAdditionalLabspaces((labspaces) => [...labspaces, newLabspace]);
    },
    [setAdditionalLabspaces],
  );

  const removeLabspace = useCallback(
    (publishedRepo) => {
      setAdditionalLabspaces((labs) =>
        labs.filter((l) => l.publishedRepo !== publishedRepo),
      );
    },
    [setAdditionalLabspaces],
  );

  useEffect(() => {
    localStorage.setItem(
      "custom-labspaces",
      JSON.stringify(additionalLabspaces),
    );
  }, [additionalLabspaces]);

  if (!labspaces) {
    return (
      <div className="mt-5 text-center">
        <Spinner />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <DockerContext.Provider
      value={{
        hasLabspace,
        runningLabspace,

        stopLabspace,
        stoppingLabspace,

        startLabspace,
        startingLabspace,
        launchLog,

        highlightedLabspaces: labspaces
          .filter((l) => l.highlighted)
          .slice(0, 3),
        labspaces: additionalLabspaces,
        addLabspace,
        removeLabspace,
      }}
    >
      {children}
    </DockerContext.Provider>
  );
}

export const useDockerContext = () => useContext(DockerContext);
