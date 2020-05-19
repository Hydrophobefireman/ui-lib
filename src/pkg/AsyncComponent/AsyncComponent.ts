import { Component } from "../../component";

import { ComponentType, VNode, Props } from "../../types";
import { createElementIfNeeded } from "../common";
// import { deprecationWarning } from "../../$ui_tools";

export class AsyncComponent extends Component {
  state: {
    // promise?: Promise<VNode>;
    // fallback: VNode;
    inProgress?: boolean;
    error?: boolean;
    render?: VNode;
  };
  componentDidMount() {
    this._init();
  }
  componentDidUpdate(prevProps: Props<{}>) {
    const prevPromise =
      prevProps && (prevProps.promise || prevProps.componentPromise);
    const currPromise = this.props.promise || this.props.componentPromise;
    if (prevPromise === currPromise) return;

    this._init();
  }
  _init(): void {
    this.setState({ inProgress: true });
    const prom = this.props.promise || this.props.componentPromise;

    prom()
      .then((component: ComponentType | VNode) => {
        component = createElementIfNeeded(component);
        // if (!(component as VNode).__self) {
        //  component = createElement(component as ComponentType);
        // }
        this.setState({ render: component, inProgress: false });
      })
      .catch((x: Error) => this.setState({ error: true, inProgress: false }));
  }
  render(props: AsyncComponent["props"], state: AsyncComponent["state"]) {
    if (state.inProgress)
      return (
        createElementIfNeeded(props.fallback || props.fallbackComponent) ||
        "Loading"
      );
    if (state.error)
      return createElementIfNeeded(props.errorComponent) || "An Error Occured";
    return state.render;
  }
}
