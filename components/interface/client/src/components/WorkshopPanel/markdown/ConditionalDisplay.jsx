import { useVariables } from "../../../WorkshopContext";
import { useMemo } from "react";
import { detectOs } from "./detectOs";

/**
 * This custom markdown directive provides the ability to conditionally show content based on variable values
 * or the detected operating system of the user's browser.
 *
 * Usage examples:
 *
 *   :::conditionalDisplay{variable="variable" requiredValue="value to match"}
 *   Content to conditionally display goes here.
 *   :::
 *
 *   :::conditionalDisplay{os="mac,linux"}
 *   Content shown to Mac and Linux users.
 *   :::
 *
 *   :::conditionalDisplay{os="unix"}
 *   Equivalent shorthand for mac + linux.
 *   :::
 *
 *   :::conditionalDisplay{os="windows"}
 *   Content shown to Windows users.
 *   :::
 *
 * The following props can be used to control the display logic:
 *   - `requiredValue`: the value to match
 *   - `hasValue`: if set, the content will be shown if the variable has any value
 *   - `hasNoValue`: if set, the content will be shown if the variable is undefined or empty
 *   - `os`: comma-separated list of operating systems (`mac`, `linux`, `windows`, or alias `unix` = mac+linux)
 *
 * When both `variable` and `os` are set, both conditions must be satisfied for content to render.
 *
 * @returns
 */
export function ConditionalDisplay({
  children,
  variable,
  requiredValue,
  hasValue,
  hasNoValue,
  os,
}) {
  const { variables } = useVariables();
  const currentValue = variable ? variables[variable] || undefined : undefined;

  const shouldDisplay = useMemo(() => {
    if (os !== undefined) {
      const allowed = new Set(
        String(os)
          .split(",")
          .flatMap((token) => {
            const t = token.trim().toLowerCase();
            if (!t) return [];
            if (t === "unix") return ["mac", "linux"];
            return [t];
          }),
      );
      if (!allowed.has(detectOs())) return false;
    }

    if (variable === undefined) {
      return os !== undefined;
    }

    if (hasValue !== undefined) {
      return currentValue !== undefined && currentValue !== "";
    }
    if (hasNoValue !== undefined) {
      return currentValue === undefined || currentValue === "";
    }
    return currentValue === requiredValue;
  }, [currentValue, variable, requiredValue, hasValue, hasNoValue, os]);

  if (!shouldDisplay) {
    return null;
  }

  return <>{children}</>;
}
