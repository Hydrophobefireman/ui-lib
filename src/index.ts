export { Fragment } from "./constants";

export { createElement, createElement as h } from "./create_element";

export { render } from "./render";

export { Component, Component as default } from "./component";

export { default as config, addPluginCallback } from "./config";

/** @TODO create separate packages */
export { AsyncComponent } from "./pkg/AsyncComponent/AsyncComponent";
export {
  Router,
  loadURL,
  redirect,
  RouterSubscription,
  A,
  createRoutePath,
  Path,
} from "./pkg/router/router";

export { createRef, RefType } from "./ref";

export * from "./hooks/index";
export * from "./types/index";
export * from "./types/jsx";

export { VNode } from "./types/internal";

export { createContext } from "./context";
