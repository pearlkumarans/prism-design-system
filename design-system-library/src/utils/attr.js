/* =============================================================================
   Attribute parsing helpers shared across components.
   ============================================================================= */

export const boolAttr = (el, name) => el.hasAttribute(name);

export const enumAttr = (el, name, allowed, fallback) => {
  const value = el.getAttribute(name);
  return allowed.includes(value) ? value : fallback;
};

export const reflectBool = (el, name, value) => {
  if (value) el.setAttribute(name, '');
  else el.removeAttribute(name);
};
