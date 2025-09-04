import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

export function CodeBlockAction({ icon, onClick, completedText }) {
    const [running, setRunning] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!completed) return;
        setTimeout(() => setCompleted(false), 2000);
    }, [completed]);

    return (
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
            { completed && completedText && <>{completedText}</> }
            { running && <Spinner size="sm" /> }
            { hasError && <span className="text-danger">❌ Error</span> }
            { (!completed || (completed && !completedText)) && !running && !hasError && <span className="material-symbols-outlined">{ icon }</span> }
        </Button>
    )
}
