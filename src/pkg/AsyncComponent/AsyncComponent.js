import Component from "../../component.js";
import { createElement as h } from "../../create-element.js";

class AsyncComponent extends Component {
  constructor(props, context) {
    const { componentPromise, fallbackComponent, ..._props } = props;
    super(_props, context);
    this.state = {
      ready: false,
      componentPromise,
      finalComponent: null,
      fallbackComponent
    };
  }
  static getDerivedStateFromProps(props, state) {
    const s = state || {};
    if (s.componentPromise === props.componentPromise) return s;
    // we are still in a promise..let that load first or we will get stuck in an infinite loop
    if (props.componentPromise != null) {
      s.componentPromise = props.componentPromise;
      s.ready = false;
      s.finalComponent = null;
    }
    return s;
  }
  render(
    { eager = true, loadComponent = false, ...props },
    { ready, finalComponent }
  ) {
    if ((eager || loadComponent) && !ready) {
      this.loadComponent();
    }
    if (ready) {
      return h(finalComponent, props);
    }
    const { children, ..._props } = props;
    return this.state.fallbackComponent != null
      ? h(this.state.fallbackComponent, _props)
      : _defaultLoader;
  }

  loadComponent() {
    return this.state.componentPromise().then(ct => {
      this.setState({ ready: true, finalComponent: ct });
    });
  }
}
const _defaultLoader = h("div", null, "Loading..");
export default AsyncComponent;
export { AsyncComponent as LazyComponent };
