import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import { useVariables } from "../../../WorkshopContext";
import { useState } from "react";

/**
 * This custom markdown directive provides the ability to define a Labspace variable.
 *
 * Usage example:
 * ::variableSetButton[Button text]{variable="variableName" value="The value to set when the button is clicked"}
 *
 * Note that the variable replacement happens server-side, not in the client. This helps ensure
 * command execution and file saves work correctly with the defined variables (and reduces code duplication).
 *
 * @returns
 */
export function VariableSetButton({ children, variable, value, ...rest }) {
  const { variables, setVariable } = useVariables();

  const currentValue = variables[variable] || "";
  
  return (
    <>
      <Button
        variant={currentValue === value ? "outline-secondary" : "primary"}
        onClick={(e) => {
          e.preventDefault();
          setVariable(variable, value);
        }}
      >
        {children}
      </Button>
    </>
  );
}
