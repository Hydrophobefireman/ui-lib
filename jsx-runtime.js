import {Fragment, createElement} from "@hydrophobefireman/ui-lib";

function create(type, props, key) {
  // Automatic JSX passes its explicit key as the third argument. Copy props so
  // callers' objects are never mutated and explicit keys (including 0/"") win.
  if (key !== undefined) props = Object.assign({}, props, {key});
  return createElement(type, props);
}

export function jsx(type, props, key) {
  return create(type, props, key);
}

export const jsxs = jsx;

export function jsxDEV(type, props, key) {
  return create(type, props, key);
}

export {Fragment};
