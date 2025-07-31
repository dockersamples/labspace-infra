import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useWorkshop } from "../../WorkshopContext";
import { WorkshopNav } from "./WorkshopNav";

export function WorkshopHeader() {
  const { title, subtitle } = useWorkshop();

  return (
    <div className="workshop-header p-4 bg-light border-bottom position-sticky top-0">
      <Container fluid="sm">
        <Row>
          <Col xs={12} sm={9}>
            <h1>{title}</h1>
            <div className="workshop-subtitle text-muted">{subtitle}</div>
          </Col>
          <Col xs={12} sm={3}>
            <WorkshopNav />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
