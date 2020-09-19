import {
  Props,
  VNode,
  ComponentType,
  ComponentConstructor,
} from "../../types/index";
import { createElement } from "../../create_element";

import { Component } from "../../component";
import { assign, $push } from "../../util";
import { createElementIfNeeded } from "../common";
import { Fragment } from "../../constants";
import config from "../../config";

const pathFixRegex = /\/+$/;

function fixPath(path: string): string {
  if (path.length === 1) return path;
  return path.replace(pathFixRegex, "");
}

const _routerSubscriptions: Array<(
  e: PopStateEvent | null,
  options: {}
) => any> = [];

interface Subscription {
  (e: PopStateEvent | string): any;
}
export const RouterSubscription = {
  subscribe(fun: Subscription) {
    $push(_routerSubscriptions, fun);
  },
  unsubscribe(fun: Subscription) {
    _routerSubscriptions.splice(_routerSubscriptions.indexOf(fun), 1);
  },

  emit(e: PopStateEvent | string, options: {}) {
    _routerSubscriptions.forEach((subscription) =>
      subscription(e as PopStateEvent, options)
    );
  },
  unsubscribeAll() {
    _routerSubscriptions.length = 0;
  },
};
const sessKey = "UI--ROUTE";
function routeAction(url: string, action?: "pushState" | "replaceState") {
  if (!config.inMemoryRouter) {
    return window.history[action](null, "", url);
  } else {
    config.memoryRouteStore.setItem(sessKey, url);
  }
}

export function loadURL(url: string) {
  routeAction(url, "pushState");
  RouterSubscription.emit(url, { type: "load", native: false });
}
export function redirect(url: string) {
  routeAction(url, "replaceState");
  RouterSubscription.emit(url, { type: "redirect", native: false });
}

interface PathProps {
  match: RoutePath;
  component: any;
}
interface RouterState {
  renderPath?: string;
  child?: VNode[];
}
interface RouterProps {
  fallbackComponent?: any;
  inMemoryRouter?: boolean;
  defaultRoute?: string;
}
export class Router extends Component<RouterProps, RouterState> {
  state: RouterState;
  constructor(props: Props<RouterProps>) {
    super(props);
    this.state = {};
    this._routeChangeHandler = this._routeChangeHandler.bind(this);
    this.componentDidUpdate = this._setRouteMethod;
  }
  _setRouteMethod() {
    config.inMemoryRouter = !!this.props.inMemoryRouter;
  }
  static __emitter() {
    RouterSubscription.emit(Router.path + Router.qs, {
      type: "popstate",
      native: true,
    });
  }
  static get path(): string {
    return location.pathname;
  }

  static get qs() {
    return location.search;
  }
  static get searchParams(): URLSearchParams {
    return new URLSearchParams(Router.qs);
  }
  static _getParams(
    pathParams: RoutePath["params"],
    test: RegExpExecArray
  ): {} {
    const params = {};
    for (const i in pathParams) {
      params[pathParams[i]] = decodeURIComponent(test[i]);
    }
    return params;
  }

  static getCurrentParams(regexPath: RoutePath) {
    regexPath = createRoutePath(regexPath);
    const pathParams = regexPath.params;
    const test = regexPath.regex.exec(Router.path);
    return test ? Router._getParams(pathParams, test) : {};
  }

  componentDidMount() {
    this._setRouteMethod();
    RouterSubscription.subscribe(this._routeChangeHandler);
    window.addEventListener("popstate", Router.__emitter);
    this._routeChangeHandler(null);
  }
  componentWillUnmount() {
    window.removeEventListener("popstate", Router.__emitter);
    RouterSubscription.unsubscribe(this._routeChangeHandler);
  }
  _notFoundComponent() {
    return createElement(
      "div",
      null,
      `The Requested URL "${Router.path}" was not found`
    );
  }
  _routeChangeHandler(_e: PopStateEvent | string): void {
    const renderPath = fixPath(
      config.inMemoryRouter
        ? config.memoryRouteStore.getItem(sessKey) ||
            this.props.defaultRoute ||
            "/"
        : Router.path
    );
    const children = this.props.children as VNode[];

    let child: VNode[] = [];
    children.forEach((x) => {
      const childProps = x.props as PathProps;
      const pathinfo = createRoutePath(childProps.match);
      const test = pathinfo.regex.exec(renderPath);
      if (test) {
        const childProps = x.props as PathProps;
        const params = Router._getParams(pathinfo.params, test);
        (child as VNode[]).push(
          createElementIfNeeded(
            childProps.component,
            assign({}, x.props, { params })
          )
        );
      }
    });
    if (!child.length) {
      (child as any) = createElement(
        this.props.fallbackComponent || this._notFoundComponent
      );
    }
    this.setState({ child });
  }

  render(_: Router["props"], state: Router["state"]): VNode {
    const child = state.child;
    return createElement(Fragment, null, child);
  }
}

function _absolutePath(route: string) {
  return RegExp(`^${route}(/?)$`);
}
interface RoutePath {
  regex: RegExp;
  params: { [index: number]: string };
}
export function createRoutePath(pathString: string | RoutePath): RoutePath {
  if (!pathString) throw Error("Invalid value for match: " + pathString);
  if ((pathString as RoutePath).regex != null) return pathString as RoutePath;
  pathString = fixPath(pathString as string);
  const params: { [index: number]: string } = {};
  let i = 0;
  const pathRegex = pathString
    .split("/")
    .map((partialPath) => {
      if (partialPath[0] === ":") {
        // param matcher
        params[++i] = partialPath.substr(1); // matches will start at 1
        return "([^?\\/]+)"; //match all non whitespace lazily
      }
      return partialPath;
    })
    .join("/");

  return { regex: _absolutePath(pathRegex), params };
}

function onLinkClick(e: MouseEvent) {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
    return;
  }
  if (e.stopImmediatePropagation) {
    e.stopImmediatePropagation();
  }
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  e.preventDefault();
  const el = new URL((this as HTMLAnchorElement).href, location.href);
  const href = el.pathname + el.search + el.hash;
  loadURL(href);
}

function _call(func: EventListener, arg: MouseEvent, ref: HTMLAnchorElement) {
  return func.call(ref, arg);
}
export class A extends Component {
  _onClick: (e: MouseEvent) => void;
  constructor(props: Props<{}>) {
    super(props);
    this._onClick = (e: MouseEvent): void => {
      const current = e.currentTarget as HTMLAnchorElement;
      _call(onLinkClick, e, current);
      const userOnClick = this.props.onClick;
      userOnClick && _call(userOnClick, e, current);
    };
  }

  render(props: Props<{}>): VNode {
    return createElement("a", assign({}, props, { onClick: this._onClick }));
  }
}

export const Path = ({} as any) as ComponentConstructor<{
  match: string | RoutePath;
  component: ComponentType | string;
}>;
