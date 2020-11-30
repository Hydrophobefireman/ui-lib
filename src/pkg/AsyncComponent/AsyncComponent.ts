import { IVNodeType, Props, VNode } from "../../types/internal";

import { Component } from "../../component";
import { createElementIfNeeded } from "../common";
import { objectWithoutKeys } from "../../util";

type Renderable<T = IVNodeType> = T;
type AsyncPromResponse = Promise<Renderable>;
interface AsyncState {
  // promise?: Promise<VNode>;
  // fallback: VNode;
  inProgress?: boolean;
  error?: boolean;
  render?: Renderable;
}
interface AsyncProps<T = IVNodeType | VNode | string> {
  promise?: () => AsyncPromResponse;
  componentPromise?: () => AsyncPromResponse;
  fallback?: Renderable<T>;
  fallbackComponent?: Renderable<T> | string;
  errorComponent?: Renderable<T> | string;
}
const getPromise = (k: AsyncProps) => k.promise || k.componentPromise;
export class AsyncComponent extends Component<AsyncProps, AsyncState> {
  state: AsyncState;
  props: AsyncProps;
  componentDidMount() {
    this._init();
  }
  componentDidUpdate(prevProps: Props<AsyncProps>) {
    const prevPromise = prevProps && getPromise(prevProps);
    const currPromise = getPromise(this.props);
    if (prevPromise === currPromise) return;

    this._init();
  }
  _init(): void {
    this.setState({ inProgress: true });
    const prom = getPromise(this.props);

    prom()
      .then((component: Renderable) => {
        prom === getPromise(this.props) &&
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
