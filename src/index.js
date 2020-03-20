/**
 * You do not need to import hydrate as render will detect if any hydration is needed or not,
 * however you can stll explicitly call hydrate
 */
export { render, hydrate } from "./render.js";
export { default, default as Component } from "./component.js";
export {
  createElement,
  Fragment,
  createElement as h
} from "./create-element.js";
export { default as AsyncComponent } from "./pkg/AsyncComponent/AsyncComponent.js";
export {
  default as Router,
  loadURL,
  redirect,
  RouterSubscription,
  A,
  absolutePath
} from "./pkg/router/router.js";
