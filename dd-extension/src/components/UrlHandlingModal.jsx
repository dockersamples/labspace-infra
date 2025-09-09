import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useState } from "react";

export function UrlHandlingModal({ onLaunchConfirmation }) {
  const searchParams = new URLSearchParams(window.location.search);
  const title = searchParams.get("title");
  const location = searchParams.get("location");

  const [show, setShow] = useState(title && location);

  const handleConfirm = () => {
    setShow(false);

    searchParams.delete("title");
    searchParams.delete("location");
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`,
    );

    onLaunchConfirmation(title, location);
  };

  const handleCancel = () => {
    setShow(false);

    searchParams.delete("title");
    searchParams.delete("location");
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`,
    );
  };

  return (
    <Modal show={show} onHide={handleCancel} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="mb-0">Confirm Labspace Launch</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>You have clicked a link to launch the following Labspace:</p>
        <ul>
          <li>
            <strong>Title:</strong> {title}
          </li>
          <li>
            <strong>Location:</strong> {location}
          </li>
        </ul>
        <p>Please confirm the details and validate it's a trusted source.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Launch Labspace
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
