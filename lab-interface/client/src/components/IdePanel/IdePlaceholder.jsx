import Button from "react-bootstrap/Button";
import "./IdePlaceholder.scss";

export function IdePlaceholder({ onLaunch }) {
  return (
    <div className="vscode-placeholder" id="vscode-placeholder">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"></path>
      </svg>

      <h3>VS Code Environment</h3>
      <p>
        <strong>Password to access the editor:</strong> <code>password</code>
      </p>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        <Button onClick={() => onLaunch()} variant="primary">
          Load VS Code here
        </Button>

        <Button
          as="a"
          href="http://localhost:8085"
          target="_blank"
          variant="secondary"
        >
          Open VS Code in New Tab
        </Button>
      </div>
    </div>
  );
}
