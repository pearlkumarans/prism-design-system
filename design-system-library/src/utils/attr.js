/* =============================================================================
   Attribute parsing helpers shared across components.
   ============================================================================= */

export const boolAttr = (el, name) => el.hasAttribute(name);

export const enumAttr = (el, name, allowed, fallback) => {
  const value = el.getAttribute(name);
  if (allowed.includes(value)) return value;
  /* A SET attribute with an unknown value silently falls back to the default —
     the class of bug behind ds-kpi-card state="critical" rendering neutral. Warn
     (once per name=value, so a caller typo shows in the console without spam) to
     surface it. An ABSENT attribute (value === null) is the normal "use default"
     case and never warns. */
  if (value != null && typeof console !== 'undefined') {
    enumAttr._warned = enumAttr._warned || new Set();
    const key = `${name}=${value}`;
    if (!enumAttr._warned.has(key)) {
      enumAttr._warned.add(key);
      console.warn(`[ds] Unknown ${name}="${value}" — expected one of [${allowed.join(', ')}]; using "${fallback}".`, el);
    }
  }
  return fallback;
};

export const reflectBool = (el, name, value) => {
  if (value) el.setAttribute(name, '');
  else el.removeAttribute(name);
};
