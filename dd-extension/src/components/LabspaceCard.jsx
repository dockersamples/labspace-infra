import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

export function LabspaceCard({ labspace, onLaunch, starting, running }) {
  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title>{labspace.title}</Card.Title>
        <Card.Text>{labspace.description}</Card.Text>
      </Card.Body>
      <Card.Footer className="d-flex align-items-center justify-content-between">
        <div>
          Created by { labspace.author }
        </div>
        <Button onClick={onLaunch} disabled={starting || running}>
          {starting ? "Starting..." : "Launch"}
        </Button>
      </Card.Footer>
    </Card>
  );
}
