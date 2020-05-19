import { Component } from "../../component";
import { createElement, Fragment } from "../../create_element";
import { deprecateFunction, deprecateGetter } from "../../$ui_tools";
import { VNode, Props } from "../../types";

const pathFixRegex = /\/+$/;

function fixPath(path: string): string {
  if (path.length === 1) return path;
  return path.replace(pathFixRegex, "");
}

const _routerSubscriptions: Array<(
  e: PopStateEvent | null,
  options: {}
) => any> = [];

type Subscription = (e: PopStateEvent | string) => any;
export const RouterSubscription = {
  subscribe(fun: Subscription) {
    if (!_routerSubscriptions.includes(fun)) _routerSubscriptions.push(fun);
  },
  unsubscribe(fun: Subscription) {
    for (let i = 0; i < _routerSubscriptions.length; i++) {
      if (_routerSubscriptions[i] === fun)
        return _routerSubscriptions.splice(i, 1);
    }
  },

  emit(e: PopStateEvent | string, options: {}) {
    for (const subscription of _routerSubscriptions) {
      subscription(e as PopStateEvent, options);
    }
  },
  unsubscribeAll() {
    _routerSubscriptions.length = 0;
  },
};

export function loadURL(url: string) {
  window.history.pushState(null, "", url);
  RouterSubscription.emit(url, { type: "load", native: false });
}
export function redirect(url: string) {
  window.history.replaceState(null, "", url);
  RouterSubscription.emit(url, { type: "redirect", native: false });
}

type PathProps = {
  match: RoutePath;
  component: any;
};

export class Router extends Component {
  state: { renderPath?: string; child?: VNode };
  constructor(props: Props<{}>) {
    super(props);
    this.state = {};
    this._routeChangeHandler = this._routeChangeHandler.bind(this);
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
  componentDidMount() {
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
    const renderPath = fixPath(Router.path);
    const children = this.props.children as VNode[];

    let child: VNode[] | VNode = [];
    children.forEach((x) => {
      const childProps = x.props as PathProps;
      const pathinfo = createRoutePath(childProps.match);
      const test = pathinfo.regex.exec(renderPath);
      if (test) {
        const childProps = x.props as PathProps;

        const params = {};
        for (const i in pathinfo.params) {
          params[pathinfo.params[i]] = test[i];
        }
        (child as VNode[]).push(
          createElement(childProps.component, { ...x.props, params })
        );
      }
    });
    if (!child.length) {
      child = createElement(
        this.props.fallbackComponent || this._notFoundComponent
      );
    }
    this.setState({ child });
  }

  render(props: Router["props"], state: Router["state"]) {
    const child = state.child;
    return createElement(Fragment, null, child);
  }
}

deprecateGetter(Router, "getPath");

function _absolutePath(route: string) {
  return RegExp(`^${route}(/?)$`);
}
interface RoutePath {
  regex: RegExp;
  params: { [index: number]: string };
}
export function createRoutePath(pathString: string | RoutePath): RoutePath {
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
        return "(\\S*?)"; //match all non whitespace lazily
      }
      return partialPath;
    })
    .join("/");

  return { regex: _absolutePath(pathRegex), params };
}

export const absolutePath = deprecateFunction(
  createRoutePath,
  "absolutePath",
  "createRoutePath"
);

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
  const el = new URL((e.target as HTMLAnchorElement).href);
  const href = el.pathname + el.search + el.hash;
  loadURL(href);
}

export function A(props: any) {
  const href = props.href;
  if (href != null) {
    props.onClick = onLinkClick;
  }
  return createElement("a", props);
}

export function Path(props: Props<{ match: RoutePath; component: any }>) {
  return;
}
