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
    title: "Using containers without going all-in",
    description:
      "Run databases, debug tools, and more across your entire team with minimal setup.",
    repo: "http://github.com/mikesir87/labspace-docker-overview",
  },
];

const DockerContext = createContext();

export function DockerContextProvider({ children }) {
  const [hasLabspace, setHasLabspace] = useState(false);
  const [runningLabspace, setRunningLabspace] = useState(null);
  const [startingLabspace, setStartingLabspace] = useState(false);
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
    (repoUrl) => {
      setLaunchLog("");
      setStartingLabspace(true);

      ddClient.docker.cli.exec(
        "run",
        [
          "--rm",
          "-e",
          `LABSPACE_CONTENT_REPO=${repoUrl}`,
          "--use-api-socket",
          "dockersamples/labspace-launcher",
        ],
        {
          stream: {
            onOutput(data) {
              const newData = data.stdout ? data.stdout : data.stderr;
              setLaunchLog((l) => l + newData);
            },
            onClose(exitCode) {
              setHasLabspace(true);
              setStartingLabspace(false);
              setForceRefreshCount((c) => c + 1);
            },
          },
        },
      );
    },
    [setHasLabspace, setStartingLabspace, setForceRefreshCount, setLaunchLog],
  );

  const addLabspace = useCallback(
    (title, repo) => {
      const newLabspace = { title, repo };
      setAdditionalLabspaces((labspaces) => [...labspaces, newLabspace]);
    },
    [setAdditionalLabspaces],
  );

  const removeLabspace = useCallback(
    (repo) => {
      setAdditionalLabspaces((labs) => labs.filter((l) => l.repo !== repo));
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
