import { WorkshopBody } from "./WorkshopBody";
import { WorkshopHeader } from "./WorkshopHeader";
import "./WorkshopPanel.scss";

export function WorkshopPanel() {
  return (
    <div className="d-flex flex-column h-100">
      <WorkshopHeader />
      <WorkshopBody />
    </div>
  );
}
