import { useDockerContext } from "./DockerContext";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { LabspaceCard } from "./components/LabspaceCard";
import { LaunchModal } from "./components/LaunchModal";
import { RunningNotice } from "./components/RunningNotice";
import { useState } from "react";
import { AddLabspaceModal } from "./components/AddLabspaceModal";
import { UrlHandlingModal } from "./components/UrlHandlingModal";

export function Home() {
  const {
    hasLabspace,
    runningLabspace,
    stopLabspace,
    stoppingLabspace,
    startLabspace,
    startingLabspace,
    highlightedLabspaces,
    labspaces,
    launchLog,
    addLabspace,
    removeLabspace,
  } = useDockerContext();

  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <Container fluid className="mt-5 mb-3 pe-5">
      <Row className="align-items-center mb-3">
        <Col>
          <h2>Labspaces</h2>
          <p className="lead">
            Interactive hands-on labs for learning and training.
          </p>
        </Col>
      </Row>

      <RunningNotice
        hasLabspace={hasLabspace}
        isRunning={!!runningLabspace}
        labspaceTitle={runningLabspace ? runningLabspace.title : ""}
        onRemove={stopLabspace}
        isStopping={stoppingLabspace}
      />

      <Row className="mb-5">
        <Col xs={12}>
          <h3>Highlighted Labspaces</h3>
        </Col>

        {highlightedLabspaces.map((labspace) => (
          <Col xs={12} sm={6} md={4} key={labspace.title} className="mb-4">
            <LabspaceCard
              labspace={labspace}
              onLaunch={() => startLabspace(labspace.repo)}
              starting={startingLabspace}
              running={hasLabspace}
            />
          </Col>
        ))}
      </Row>

      <Row className="mb-5">
        <Col xs={9}>
          <h3>Other Labspaces</h3>
          <p className="lead">
            Labspaces can come from anywhere in the community! Find more or add
            your own below!
          </p>
        </Col>
        <Col xs={3} className="text-end">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Add Labspace
          </Button>
        </Col>

        <Col xs={12}>
          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Repo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {labspaces.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center">
                    <em>
                      No additional Labspaces are available at this time. Add
                      your own!
                    </em>
                  </td>
                </tr>
              )}
              {labspaces.map((labspace) => (
                <tr key={labspace.title}>
                  <td className="align-middle">{labspace.title}</td>
                  <td className="align-middle">
                    <a
                      href={labspace.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {labspace.repo}
                    </a>
                  </td>
                  <td className="text-end">
                    <Button
                      variant="primary"
                      onClick={() => startLabspace(labspace.repo)}
                      className="me-2"
                    >
                      Launch
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => removeLabspace(labspace.repo)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <LaunchModal launchLog={launchLog} starting={startingLabspace} />
      <AddLabspaceModal
        show={showAddModal}
        onAdd={(title, repo) => {
          addLabspace(title, repo);
          setShowAddModal(false);
        }}
        onCancel={() => setShowAddModal(false)}
      />

      <UrlHandlingModal
        onLaunchConfirmation={(title, repo) => {
          if (labspaces.find((l) => l.repo === repo) === undefined)
            addLabspace(title, repo);
          startLabspace(repo);
        }}
      />
    </Container>
  );
}
