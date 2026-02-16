import { useParams, NavLink } from "react-router";
import { useWorkshop } from "../../WorkshopContext";

export function ServicesNav() {
  const { appId, sectionId } = useParams();
  const { services } = useWorkshop();

  let currentSection = sectionId ? sectionId : "";
  const renderList = services.length > 0;
  let renderServices = services;

  if (services.length > 0 && services[0].id !== "workbook") {
    renderServices = [
      {
        id: "workbook",
        url: "/workbook/" + currentSection,
        icon: "code",
        title: "Code Editor",
      },
      ...services,
    ];
  }

  return (
    <>
      {renderList ? (
        <ul className="app-nav nav flex-column text-center">
          {renderServices.map((service, index) => (
            <li key={service.id} className="nav-item">
              <NavLink
                active={appId === service.id}
                className="nav-link btn"
                to={"/" + service.id + "/" + currentSection}
              >
                <span className="badge rounded-pill">
                  <span className="app-icon material-symbols-outlined">
                    {service.icon}
                  </span>
                </span>
                <br />
                {service.title}
              </NavLink>
            </li>
          ))}
        </ul>
      ) : (
        ""
      )}
    </>
  );
}
