import Component from "../../component.js";
import { createElement as h } from "../../create-element.js";

class AsyncComponent extends Component {
  constructor(props, context) {
    const { componentPromise, fallbackComponent, children, ..._props } = props;
    super(_props, context);
    this.state = {
      children,
      ready: false,
      componentPromise,
      finalComponent: null,
      fallbackComponent
    };
  }
  render(
    { eager = true, loadComponent = false, ...props },
    { ready, finalComponent, children }
  ) {
    if ((eager || loadComponent) && !ready) {
      this.loadComponent();
    }
    if (ready) {
      return h(finalComponent, props, children);
    }
    return this.state.fallbackComponent != null
      ? h(this.state.fallbackComponent, props)
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
