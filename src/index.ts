export {Fragment} from "./constants";

export {createElement, createElement as h} from "./create_element";

export {render} from "./render";

export {Component, Component as default} from "./component";

export {default as config, addPluginCallback} from "./config";

/** @TODO create separate packages */
export {AsyncComponent} from "./pkg/AsyncComponent/AsyncComponent";
export {Router, Path} from "./pkg/router/router";

export {loadURL, redirect, createRoutePath} from "./pkg/router/util";
export {A} from "./pkg/router/A";
export {RouterSubscription} from "./pkg/router/subscriptions";

export {useRoute} from "./pkg/router/router-hooks";

export {createRef, RefType} from "./ref";

export * from "./hooks/index";
export * from "./types/index";
export * from "./types/jsx";
export {forwardRef} from "./forward_ref";
export {createContext} from "./context";

export {diff} from "./diff";
