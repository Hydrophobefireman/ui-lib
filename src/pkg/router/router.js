import Component from "../../component.js";
import { createElement as h, Fragment } from "../../create-element.js";
import { EMPTY_OBJ } from "../../util.js";
/**
 * @type {Array<(e:PopStateEvent|null)=>any>}
 */
const _routerSubscriptions = [];
export const RouterSubscription = {
  /**
   * @param {(e:PopStateEvent|null)=>any} fun
   */
  subscribe(fun) {
    _routerSubscriptions.push(fun);
  },
  unsubscribe(fun) {
    _routerSubscriptions.filter(fn => fn !== fun);
  },
  /**
   * @param {PopStateEvent|null} e
   */
  emit(e, options) {
    for (const subscription of _routerSubscriptions) {
      subscription(e, options);
    }
  },
  unsubscribeAll() {
    _routerSubscriptions = [];
  }
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
  componentWillMount() {
    RouterSubscription.subscribe(this._routeChangeHandler);
    window.addEventListener("popstate", RouterSubscription.emit);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", RouterSubscription.emit);
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
    this.component = this.match = null;
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
    for (const child of c) {
      if (child.props != null && child.props.path != null) {
        this.state.routes.push({
          regex: child.props.path,
          component: child
        });
      }
    }
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
    this.state = { routes: [], fallbackComponent };
    this.initComponents(children);
    const [component, match] = this.getCurrentComponent();
    this.component = component;
    this.match = match;
    this._routeChangeHandler = this._routeChangeHandler.bind(this);
  }
  render() {
    /**
     * @type {import("../../ui").vNode}
     */
    let c;
    if (this.state.component != null && this.state.match != null) {
      c = this.state.component;
    } else if (this.component) {
      c = this.component;
    } else {
      c = h(this.state.fallbackComponent, this.props);
    }
    if (!c.__uAttr) c = h(c, { match: this.state.match, ...this.props });
    return h(Fragment, null, c);
  }
}

export function A(props) {
  const { native, ...p } = props;
  return h("a", {
    onclick: !native ? e => onLinkClick(e, props.href) : null,
    ...p
  });
}
/**
 *
 * @param {MouseEvent} e
 */
function onLinkClick(e, href) {
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
}
export function absolutePath(route) {
  return RegExp(`^${route}$`);
}

export default Router;
