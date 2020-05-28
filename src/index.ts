export { createElement, createElement as h, Fragment } from "./create_element";

export { render } from "./render";

export { Component, Component as default } from "./component";

export { default as config } from "./config";

/** @TODO create separate packages */
export { AsyncComponent } from "./pkg/AsyncComponent/AsyncComponent";
export {
  Router,
  loadURL,
  redirect,
  RouterSubscription,
  A,
  absolutePath,
  createRoutePath,
  Path,
} from "./pkg/router/router";
