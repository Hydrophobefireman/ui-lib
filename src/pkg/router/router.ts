import {Component} from "../../component.js";
import config from "../../config.js";
import {createContext} from "../../context.js";
import {createElement} from "../../create_element.js";
import type {
  ComponentConstructor,
  Props,
  Renderable,
  VNode,
} from "../../types/index.js";
import {assign} from "../../util.js";
import {createElementIfNeeded} from "../common.js";
import {RouterSubscription} from "./subscriptions.js";
import {createRoutePath, fixPath, sessKey} from "./util.js";
import type {RoutePath} from "./util.js";

export const RouteParamContext = createContext<{
  params: {[k: string]: string};
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
  params?: {[k: string]: string};
}
interface RouterProps {
  fallbackComponent?: any;
  inMemoryRouter?: boolean;
}

export class Router extends Component<RouterProps, RouterState> {
  declare state: RouterState;
  private _previous: string;
  private static _popstateSubscriptions = 0;
  constructor(props: Props<RouterProps>) {
    super(props);
    this.state = {};
    this._routeChangeHandler = this._routeChangeHandler.bind(this);
  }
  _setRouteMethod() {
    config.inMemoryRouter = !!this.props.inMemoryRouter;
  }
  static _location() {
    return Router.path + Router.qs;
  }
  static __emitter() {
    RouterSubscription.emit(Router._location(), {
      type: "popstate",
      native: true,
    });
  }
  private static _subscribePopstate() {
    if (Router._popstateSubscriptions++ === 0) {
      window.addEventListener("popstate", Router.__emitter);
    }
  }
  private static _unsubscribePopstate() {
    if (Router._popstateSubscriptions === 0) return;
    if (--Router._popstateSubscriptions === 0) {
      window.removeEventListener("popstate", Router.__emitter);
    }
  }
  static get path(): string {
    if (config.inMemoryRouter) {
      const str = config.memoryRouteStore.getItem(sessKey);
      if (!str) return "/";
      return JSON.parse(str).path || "/";
    }
    return config.window.location.pathname;
  }

  static get qs() {
    if (config.inMemoryRouter) {
      const str = config.memoryRouteStore.getItem(sessKey);
      if (!str) return "?";
      return JSON.parse(str).qs || "?";
    }
    return config.window.location.search;
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
  // @safe
  componentDidMount() {
    this._setRouteMethod();
    RouterSubscription.subscribe(this._routeChangeHandler);
    Router._subscribePopstate();
    this._routeChangeHandler(null);
  }
  // @safe
  componentWillUnmount() {
    Router._unsubscribePopstate();
    RouterSubscription.unsubscribe(this._routeChangeHandler);
  }
  componentDidUpdate(prevProps: Props<RouterProps>) {
    const modeChanged =
      !!this.props.inMemoryRouter !== !!prevProps.inMemoryRouter;
    const routesChanged =
      prevProps.children !== this.props.children ||
      prevProps.fallbackComponent !== this.props.fallbackComponent;
    this._setRouteMethod();
    if (modeChanged || routesChanged) {
      // Route declarations changed without a location change; rematch instead
      // of waiting for the next navigation event.
      this._previous = undefined;
      this._routeChangeHandler(null);
    }
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
    const curr = Router._location();
    this._previous = curr;
    if (prev === curr) return;

    const renderPath = fixPath(Router.path);
    const children = (this.props.children || []) as VNode[];
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
          assign({}, x.props, {params})
        );
        break;
      }
    }

    if (!child) {
      (child as any) = createElement(
        this.props.fallbackComponent || this._notFoundComponent
      );
    }
    this.setState({child, params});
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

export const Path = {} as any as ComponentConstructor<{
  match: string | RoutePath;
  component: Renderable<any>;
}>;
