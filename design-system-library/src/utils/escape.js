/* Escape a consumer-provided string for safe interpolation into innerHTML.
   Use this whenever a data-derived label/value/attribute goes into a template
   literal that becomes innerHTML — labels are frequently bound to server data
   (names, titles, options), so they must never be injected as raw HTML.

   For plain text prefer `el.textContent = value`; use escapeHtml() only when the
   value must sit inside a larger HTML string or an attribute. */
export const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

/* A chunk of HTML that is safe to assign to innerHTML because every dynamic value
   in it has been escaped. Build one with the `safeHtml` tagged template — the
   static markup is trusted, the ${interpolated} values are escaped:

     safeHtml`<a href="${row.url}">${row.name}</a>`   // url/name escaped

   This is the safe way to return rich HTML from a data-table cell renderer that
   includes server/user data (vs. a raw string, which is injected verbatim). A
   nested SafeHtml value is inlined without re-escaping, so fragments compose. */
export class SafeHtml {
  constructor(html) { this.html = html; }
  toString() { return this.html; }
}
export const isSafeHtml = (v) => v instanceof SafeHtml;
export function safeHtml(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    out += (v instanceof SafeHtml ? v.html : escapeHtml(v)) + strings[i + 1];
  }
  return new SafeHtml(out);
}
