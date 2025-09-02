import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useEffect, useState } from "react";

export function LaunchModal({ launchLog, starting }) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (starting) setShowModal(true);
  }, [starting]);

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <Modal show={showModal} size="lg">
      <Modal.Header>
        <Modal.Title className="mb-0">Launching Labspace</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {launchLog ? (
          <pre style={{ maxHeight: "400px", overflowY: "auto" }}>
            {launchLog}
          </pre>
        ) : (
          <div className="d-flex align-items-center">
            <Spinner size="sm" className="me-3" />
            <div>Launching...</div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" disabled={starting} onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          disabled={starting}
          onClick={() => {
            ddClient.host.openExternal("http://localhost:3030");
            handleClose();
          }}
        >
          Open Labspace
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
