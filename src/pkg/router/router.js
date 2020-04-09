import { Component } from "../../component";
import { createElement as h, Fragment } from "../../create_element";
import { EMPTY_OBJ, assign } from "../../util";
/**
 * @type {Array<(e:PopStateEvent|null)=>any>}
 */
const _routerSubscriptions = [];
export const RouterSubscription = {
  /**
   * @param {(e:PopStateEvent|null)=>any} fun
   */
  subscribe(fun) {
    if (!_routerSubscriptions.includes(fun)) _routerSubscriptions.push(fun);
  },
  unsubscribe(fun) {
    for (let i = 0; i < _routerSubscriptions.length; i++) {
      if (_routerSubscriptions[i] === fun)
        return _routerSubscriptions.splice(i, 1);
    }
  },
  /**
   * @param {string} e
   */
  emit(e, options) {
    for (const subscription of _routerSubscriptions) {
      subscription(e, options);
    }
  },
  unsubscribeAll() {
    _routerSubscriptions.length = 0;
  },
};

export function loadURL(url) {
  window.history.pushState(EMPTY_OBJ, document.title, url);
  RouterSubscription.emit(url, { type: "load", native: false });
}
export function redirect(url) {
  window.history.replaceState(EMPTY_OBJ, document.title, url);
  RouterSubscription.emit(url, { type: "redirect", native: false });
}
class Router extends Component {
  static __emitter() {
    RouterSubscription.emit(Router.getPath + Router.getQs, {
      type: "popstate",
      native: true,
    });
  }
  componentWillMount() {
    RouterSubscription.subscribe(this._routeChangeHandler);
    window.addEventListener("popstate", Router.__emitter);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", Router.__emitter);
    if (this.props.destroySubscriptionOnUnmount) {
      RouterSubscription.unsubscribeAll();
    }
  }
  absolute(path) {
    return new URL(
      path || "",
      `${location.protocol}//${location.host}`
    ).toString();
  }
  getCurrentComponent() {
    const currentPath = Router.getPath;
    return this.getPathComponent(currentPath) || [];
  }
  _routeChangeHandler() {
    const [component, match] = this.getCurrentComponent();
    this.setState({ component, match });
  }
  _notFoundComponent() {
    return h(
      "div",
      null,
      `The Requested URL "${this.absolute(Router.getPath)}" was not found`
    );
  }
  static get getPath() {
    return location.pathname;
  }
  static get getQs() {
    return location.search;
  }
  /**
   * @returns {[any,RegExpExecArray]}
   */
  getPathComponent(route) {
    for (const obj of this.state.routes) {
      const { regex, component } = obj;
      const match = regex.exec(route);
      if (match) {
        return [component, match];
      }
    }
    return [];
  }
  initComponents(c) {
    const _routes = [];
    for (const child of c) {
      if (child.props != null && child.props.path != null) {
        _routes.push({
          regex: child.props.path,
          component: child,
        });
      }
    }
    return _routes;
  }
  /**
   *
   * @param {{children:Array<import("../ui").vNode>}} routerProps
   * @param {object} context
   */
  constructor(routerProps, context) {
    let { children, fallbackComponent, ...props } = routerProps;
    super(props, context);
    fallbackComponent = fallbackComponent || this._notFoundComponent.bind(this);
    this.state = { routes: this.initComponents(children), fallbackComponent };
    const [component, match] = this.getCurrentComponent();
    this.state.component = component;
    this.state.match = match;
    this._routeChangeHandler = this._routeChangeHandler.bind(this);
  }
  componentDidMount() {
    // this._routeChangeHandler();
  }
  render() {
    /**
     * @type {import("../../ui").vNode}
     */
    let c;
    const { children, ..._props } = this.props;
    const sendProps = { match: this.state.match, ..._props };
    if (this.state.component != null && this.state.match != null) {
      c = this.state.component;
      assign(c.props, sendProps);
    } else {
      c = h(this.state.fallbackComponent, sendProps);
    }
    if (!c.__self) c = h(c, sendProps);

    return h(Fragment, null, c);
  }
}

export function A(props) {
  const { native, href, onClick, ...p } = props;
  const setProps = p;
  setProps.href = href;
  if (!native && href != null) {
    setProps.onClick = (e) => onLinkClick(e, props.href, onClick);
  }
  return h("a", setProps);
}
/**
 *
 * @param {MouseEvent} e
 */
function onLinkClick(e, href, func) {
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
  loadURL(href);
  if (func != null) func(e, href);
}
export function absolutePath(route) {
  return RegExp(`^${route}(/?)$`);
}

export default Router;
