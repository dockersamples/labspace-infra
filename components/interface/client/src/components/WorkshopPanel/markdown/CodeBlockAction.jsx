import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

export function CodeBlockAction({ icon, onClick, completedText, tooltip }) {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!completed) return;
    setTimeout(() => setCompleted(false), 2000);
  }, [completed]);

  return (
    <OverlayTrigger
      placement="top"
      overlay={(props) =>
        tooltip ? (
          <Tooltip id={`tooltip-${icon}`} {...props}>
            {tooltip}
          </Tooltip>
        ) : (
          <></>
        )
      }
    >
      <Button
        className="m-2"
        variant="secondary"
        size="sm"
        onClick={() => {
          setRunning(true);
          onClick()
            .then(() => setCompleted(true))
            .catch(() => setHasError(true))
            .finally(() => setRunning(false));
        }}
        disabled={running}
      >
        {completed && completedText && <>{completedText}</>}
        {running && <Spinner size="sm" />}
        {hasError && <span className="text-danger">❌ Error</span>}
        {(!completed || (completed && !completedText)) &&
          !running &&
          !hasError && (
            <span className="material-symbols-outlined">{icon}</span>
          )}
      </Button>
    </OverlayTrigger>
  );
}
