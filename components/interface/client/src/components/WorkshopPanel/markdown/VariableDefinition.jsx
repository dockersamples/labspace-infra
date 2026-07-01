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
 * ::variableDefinition[variableName]{prompt="What is your username?"}
 *
 * With this directive, the variableName is provided to this component as `children`.
 *
 * Once defined, variables can be used anywhere in the Markdown using the $$variableName$$ syntax.
 *
 * Note that the variable replacement happens server-side, not in the client. This helps ensure
 * command execution and file saves work correctly with the defined variables (and reduces code duplication).
 *
 * @returns
 */
export function VariableDefinition({ children, prompt, ...rest }) {
  const { variables, setVariable } = useVariables();
  const [value, setValue] = useState(variables[children] || "");

  const hasValue =
    variables[children] !== undefined && variables[children] !== "";
  const valueChanged = value !== (variables[children] || "");

  return (
    <Card className="mb-3" border={hasValue ? "" : "warning"}>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          setVariable(children, value);
        }}
      >
        <Card.Body>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>
              {prompt || `WARNING: NO PROMPT DEFINED FOR ${children}`}
            </Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <Button
                variant={valueChanged ? "primary" : "outline-secondary"}
                disabled={!valueChanged}
                type="submit"
              >
                {hasValue ? "Update" : "Set"}
              </Button>
            </InputGroup>
          </Form.Group>
        </Card.Body>
      </Form>
    </Card>
  );
}
