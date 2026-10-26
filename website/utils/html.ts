export const stripHTML = (str: string) =>
  str.replace(
    /(<([^>]+)>)/gi,
    "",
  );

/**
 * Strips HTML tags from every string value in the tree, leaving structure
 * untouched. Tag removal must happen per string value: running stripHTML on
 * an already-serialized JSON string lets a `<` in one value pair with a `>`
 * in another (or with JSON syntax), deleting structural quotes and braces
 * and producing invalid JSON.
 */
// deno-lint-ignore no-explicit-any
function stripHTMLDeep(value: any): any {
  if (typeof value === "string") {
    return stripHTML(value);
  }
  if (Array.isArray(value)) {
    return value.map(stripHTMLDeep);
  }
  if (value !== null && typeof value === "object") {
    // deno-lint-ignore no-explicit-any
    const out: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = stripHTMLDeep(val);
    }
    return out;
  }
  return value;
}

export function safeJsonSerialize(
  // deno-lint-ignore no-explicit-any
  obj: any,
  options?: { returnAsString?: boolean },
) {
  if (!obj) {
    return options?.returnAsString ? "{}" : {};
  }

  if (typeof obj !== "object") {
    return options?.returnAsString ? String(obj) : obj;
  }

  const clean = stripHTMLDeep(obj);

  if (options?.returnAsString) {
    // Escape the characters that could terminate the surrounding <script>
    // element. `<` only ever appears inside JSON string values, so a global
    // replace cannot touch structure.
    return JSON.stringify(clean)
      .replaceAll("<", "\\u003c")
      .replaceAll(">", "\\u003e")
      .replaceAll("&", "\\u0026");
  }

  return clean;
}
