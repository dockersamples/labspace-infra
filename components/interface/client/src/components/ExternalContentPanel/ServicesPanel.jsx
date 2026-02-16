import { useParams } from "react-router";
import { useWorkshop } from "../../WorkshopContext";

export function ServicesPanel() {
  const { appId } = useParams();
  const { services } = useWorkshop();

  return (
    <>
      {services.map((service, index) => (
        <div
          key={service.id}
          className={appId === service.id ? "d-flex flex-fill" : "d-none"}
        >
          <iframe
            style={{ width: "100%", height: "100%" }}
            src={service.url}
          ></iframe>
        </div>
      ))}
    </>
  );
}
