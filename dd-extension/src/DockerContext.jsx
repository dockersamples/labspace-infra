import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { parse } from "yaml";

const HIGHLIGHTED_LABSPACES = [
  {
    title: "Container-supported development",
    description:
      "Use containers to easily run and version databases, debug tools, and more across your entire team with minimal setup.",
    location: "dockersamples/labspace-container-supported-development",
  },
];

const DockerContext = createContext();

export function DockerContextProvider({ children }) {
  const [hasLabspace, setHasLabspace] = useState(false);
  const [runningLabspace, setRunningLabspace] = useState(null);
  const [startingLabspace, setStartingLabspace] = useState(null);
  const [stoppingLabspace, setStoppingLabspace] = useState(false);
  const [launchLog, setLaunchLog] = useState("");
  const [forceRefreshCount, setForceRefreshCount] = useState(0);
  const [additionalLabspaces, setAdditionalLabspaces] = useState(
    localStorage.getItem("labspaces")
      ? JSON.parse(localStorage.getItem("labspaces"))
      : [],
  );

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
      setLaunchLog("");
      setStartingLabspace(location);

      ddClient.docker.cli.exec(
        "compose",
        [
          "-f",
          `oci://${location}`,
          "-p",
          "labspace",
          "up",
          "-d",
          "-y",
        ],
        {
          stream: {
            onOutput(data) {
              const newData = data.stdout ? data.stdout : data.stderr;
              setLaunchLog((l) => l + newData);
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
    (title, location) => {
      const newLabspace = { title, location };
      setAdditionalLabspaces((labspaces) => [...labspaces, newLabspace]);
    },
    [setAdditionalLabspaces],
  );

  const removeLabspace = useCallback(
    (location) => {
      setAdditionalLabspaces((labs) => labs.filter((l) => l.location !== location));
    },
    [setAdditionalLabspaces],
  );

  useEffect(() => {
    localStorage.setItem("labspaces", JSON.stringify(additionalLabspaces));
  }, [additionalLabspaces]);

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

        highlightedLabspaces: HIGHLIGHTED_LABSPACES.slice(0, 3),
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
