import { ComponentType, Props, VNode } from "../../types/index";

import { Component } from "../../component";
import { createElementIfNeeded } from "../common";
import { objectWithoutKeys } from "../../util";

type Renderable = ComponentType | VNode | string;
type AsyncPromResponse = Promise<Renderable>;
interface AsyncState {
  // promise?: Promise<VNode>;
  // fallback: VNode;
  inProgress?: boolean;
  error?: boolean;
  render?: Renderable;
}
interface AsyncProps {
  promise?: () => AsyncPromResponse;
  componentPromise?: () => AsyncPromResponse;
  fallback?: Renderable;
  fallbackComponent?: Renderable | string;
  errorComponent?: Renderable | string;
}
export class AsyncComponent extends Component<AsyncProps, AsyncState> {
  state: AsyncState;
  props: AsyncProps;
  componentDidMount() {
    this._init();
  }
  componentDidUpdate(prevProps: Props<AsyncProps>) {
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
      .then((component: Renderable) => {
        this.setState({ render: component, inProgress: false, error: false });
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
    return createElementIfNeeded(
      state.render,
      objectWithoutKeys(props, [
        "fallback",
        "fallbackComponent",
        "promise",
        "componentPromise",
      ])
    );
  }
}
