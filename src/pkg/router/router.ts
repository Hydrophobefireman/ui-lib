import { assign } from "../../util";
import {
  ComponentConstructor,
  Props,
  Renderable,
  VNode,
} from "../../types/index";

import { Component } from "../../component";
import config from "../../config";
import { createElement } from "../../create_element";
import { createElementIfNeeded } from "./../common";

import { RouterSubscription } from "./subscriptions";
import { fixPath, RoutePath, sessKey, createRoutePath } from "./util";
import { createContext } from "../../context";

export const RouteParamContext = createContext<{
  params: { [k: string]: string };
  search: URLSearchParams;
  path: string;
}>(null);

interface PathProps {
  match: RoutePath;
  component: any;
}
interface RouterState {
  renderPath?: string;
  child?: VNode;
  params?: { [k: string]: string };
}
interface RouterProps {
  fallbackComponent?: any;
  inMemoryRouter?: boolean;
}

export class Router extends Component<RouterProps, RouterState> {
  state: RouterState;
  private _previous: string;
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
    if (config.inMemoryRouter) {
      const str = config.memoryRouteStore.getItem(sessKey);
      if (!str) return "/";
      return JSON.parse(str).path || "/";
    }
    return window.location.pathname;
  }

  static get qs() {
    if (config.inMemoryRouter) {
      const str = config.memoryRouteStore.getItem(sessKey);
      if (!str) return "?";
      return JSON.parse(str).qs || "?";
    }
    return window.location.search;
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
    const prev = this._previous;
    const curr = Router.path;
    this._previous = curr;
    if (prev === curr) return;

    const renderPath = fixPath(Router.path);
    const children = this.props.children as VNode[];
    let child: VNode;
    let params: any;
    for (let i = 0; i < children.length; i++) {
      const x = children[i];
      const childProps = x.props as PathProps;
      const pathinfo = createRoutePath(childProps.match);
      const test = pathinfo.regex.exec(renderPath);
      if (test) {
        const childProps = x.props as PathProps;
        params = Router._getParams(pathinfo.params, test);
        child = createElementIfNeeded(
          childProps.component,
          assign({}, x.props, { params })
        );
        break;
      }
    }

    if (!child) {
      (child as any) = createElement(
        this.props.fallbackComponent || this._notFoundComponent
      );
    }
    this.setState({ child, params });
  }

  render(_: Router["props"], state: Router["state"]): VNode {
    const child = state.child;
    return createElement(
      RouteParamContext.Provider,
      {
        //@ts-ignore
        value: {
          params: state.params,
          path: Router.path,
          search: Router.searchParams,
        },
      },
      child
    );
  }
}

export const Path = ({} as any) as ComponentConstructor<{
  match: string | RoutePath;
  component: Renderable<any>;
}>;
