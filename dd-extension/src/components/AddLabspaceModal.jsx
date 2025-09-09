import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";

export function AddLabspaceModal({ show, onAdd, onCancel }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onAdd(title, location);
    setTitle("");
    setLocation("");
  }

  function handleCancel() {
    setTitle("");
    setLocation("");
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

          <Form.Group className="mb-3" controlId="labspaceComposeFile">
            <Form.Label>Labspace location</Form.Label>
            <InputGroup>
              <InputGroup.Text>oci://</InputGroup.Text>
              <Form.Control
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </InputGroup>
            <Form.Text muted>
              Location of the published Compose file for the Labspace
            </Form.Text>
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
