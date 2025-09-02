import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useState } from "react";

export function UrlHandlingModal({ onLaunchConfirmation }) {
  const searchParams = new URLSearchParams(window.location.search);
  const title = searchParams.get("title");
  const repo = searchParams.get("repo");

  const [show, setShow] = useState(title && repo);

  const handleConfirm = () => {
    setShow(false);

    searchParams.delete("title");
    searchParams.delete("repo");
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`,
    );

    onLaunchConfirmation(title, repo);
  };

  const handleCancel = () => {
    setShow(false);

    searchParams.delete("title");
    searchParams.delete("repo");
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`,
    );
  };

  return (
    <Modal show={show} onHide={handleCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title className="mb-0">Confirm Labspace Launch</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>You are about to launch a Labspace with the following details:</p>
        <ul>
          <li>
            <strong>Title:</strong> {title}
          </li>
          <li>
            <strong>Repo:</strong> {repo}
          </li>
        </ul>
        <p>Please verify these details before continuing.</p>
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
