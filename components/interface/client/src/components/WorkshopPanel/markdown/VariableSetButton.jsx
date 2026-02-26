import Button from "react-bootstrap/Button";
import { useVariables } from "../../../WorkshopContext";
import { useCallback, useMemo } from "react";

/**
 * This custom markdown directive provides the ability to define a Labspace variable.
 *
 * Usage example:
 * ::variableSetButton[Button text]{variables="variable1=The value to set when the button is clicked,variable2=Another value"}
 *
 * Note that the variable replacement happens server-side, not in the client. This helps ensure
 * command execution and file saves work correctly with the defined variables (and reduces code duplication).
 *
 * @returns
 */
export function VariableSetButton({
  children,
  variables: variablesToSetString,
  ...rest
}) {
  const { variables, setVariable } = useVariables();

  // Create a map of { [variableName]: value } for the variables to set
  const variablesToSet = useMemo(() => {
    return variablesToSetString
      .split(",")
      .map((variable) => variable.split("="))
      .reduce((prev, curr) => ({ ...prev, [curr[0]]: curr[1] }), {});
  }, [variablesToSetString]);

  const allSet = useMemo(() => {
    return (
      Object.keys(variablesToSet).filter(
        (variableName) =>
          variables[variableName] !== variablesToSet[variableName],
      ).length === 0
    );
  }, [variablesToSet, variables]);

  const onClick = useCallback(
    (e) => {
      e.preventDefault();
      Object.keys(variablesToSet).forEach((variableName) =>
        setVariable(variableName, variablesToSet[variableName]),
      );
    },
    [variablesToSet, setVariable],
  );

  return (
    <>
      <Button
        variant={allSet ? "outline-secondary" : "primary"}
        onClick={onClick}
      >
        {children}
      </Button>
    </>
  );
}
