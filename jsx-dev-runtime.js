import {Fragment, createElement} from "@hydrophobefireman/ui-lib";

function create(type, props, key) {
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
