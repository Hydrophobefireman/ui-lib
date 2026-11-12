export {Fragment} from "./constants.js";

export {createElement, createElement as h} from "./create_element.js";

export {render} from "./render.js";

export {Component, Component as default} from "./component.js";

export {default as config, addPluginCallback} from "./config.js";

/** @TODO create separate packages */
export {AsyncComponent} from "./pkg/AsyncComponent/AsyncComponent.js";
export {Router, Path} from "./pkg/router/router.js";

export {loadURL, redirect, createRoutePath} from "./pkg/router/util.js";
export {A} from "./pkg/router/A.js";
export {RouterSubscription} from "./pkg/router/subscriptions.js";

export {useRoute} from "./pkg/router/router-hooks.js";

export {createRef} from "./ref.js";
export type {RefType} from "./ref.js";

export * from "./hooks/index.js";
export type * from "./types/index.js";
export type * from "./types/jsx.js";
export {forwardRef} from "./forward_ref.js";
export {createContext} from "./context.js";

export {diff} from "./diff/index.js";
