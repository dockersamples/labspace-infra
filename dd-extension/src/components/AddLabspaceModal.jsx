import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export function AddLabspaceModal({ show, onAdd, onCancel }) {
  const [title, setTitle] = useState("");
  const [repo, setRepo] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onAdd(title, repo);
    setTitle("");
    setRepo("");
  }

  function handleCancel() {
    setTitle("");
    setRepo("");
    onCancel();
  }

  return (
    <Modal show={show} onHide={handleCancel}>
      <Modal.Header closeButton>
        <Modal.Title className="mb-0">Add Labspace</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="labspaceTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="labspaceRepo">
            <Form.Label>Repo</Form.Label>
            <Form.Control
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            Close
          </Button>
          <Button variant="primary" type="submit">
            Add Labspace
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
