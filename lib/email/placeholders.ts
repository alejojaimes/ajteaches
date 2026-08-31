/** `{{name}}`-style placeholders that survived rendering unresolved. */
export function findUnresolvedPlaceholders(text: string): string[] {
  const matches = text.match(/\{\{[^}]+\}\}/g);
  return matches ? Array.from(new Set(matches)) : [];
}
