import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

export function RunningNotice({
  hasLabspace,
  isRunning,
  labspaceTitle,
  onRemove,
  isStopping,
}) {
  return (
    <>
      {hasLabspace && (
        <Row>
          <Col>
            <Alert variant={isRunning ? "success" : "warning"} className="mb-5">
              <div className="d-flex align-items-center">
                <div className="me-auto">
                  {isRunning ? (
                    <>
                      The <strong>{labspaceTitle}</strong> Labspace is currently
                      running!
                    </>
                  ) : (
                    <>
                      A previously running Labspace has been found and will need
                      to be cleaned up
                    </>
                  )}
                </div>

                <div>
                  {isStopping ? (
                    <>
                      <Spinner size="sm" />
                      &nbsp;Removing...
                    </>
                  ) : (
                    <>
                      {isRunning && (
                        <Button
                          variant="link"
                          onClick={() =>
                            ddClient.host.openExternal("http://localhost:3030")
                          }
                        >
                          Open
                        </Button>
                      )}
                      <Button variant="link" onClick={onRemove}>
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Alert>
          </Col>
        </Row>
      )}
    </>
  );
}
