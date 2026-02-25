import { useVariables } from "../../../WorkshopContext";
import { useMemo } from "react";

/**
 * This custom markdown directive provides the ability to conditionally show content based on variable values.
 *
 * Usage example:
 * :::conditionalDisplay{variable="variable" requiredValue="value to match"}
 * Content to conditionally display goes here.
 * :::
 *
 * The following props can be used to control the display logic:
 *   - `requiredValue`: the value to match
 *   - `hasValue`: if set, the content will be shown if the variable has any value
 *   - `hasNoValue`: if set, the content will be shown if the variable is undefined or empty
 *
 * @returns
 */
export function ConditionalDisplay({ children, variable, requiredValue, hasValue, hasNoValue, ...rest }) {
  const { variables } = useVariables();
  const currentValue = variables[variable] || undefined;

  const shouldDisplay = useMemo(() => {
    if (hasValue !== undefined) {
      return currentValue !== undefined && currentValue !== "";
    }
    if (hasNoValue !== undefined) {
      return currentValue === undefined || currentValue === "";
    }
    return currentValue === requiredValue;
  }, [currentValue, variable, requiredValue, hasValue]);

  if (!shouldDisplay) {
    return null;
  }

  return (
    <>
      {children}
    </>
  );
}
