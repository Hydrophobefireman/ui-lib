import {Props, Renderable as UIElement} from "../../types/index";

import {Component} from "../../component";
import {createElementIfNeeded} from "../common";
import {objectWithoutKeys} from "../../util";

type AsyncPromResponse<T = any> = Promise<UIElement<T>>;
interface AsyncState {
  // promise?: Promise<VNode>;
  // fallback: VNode;
  inProgress?: boolean;
  error?: boolean;
  render?: UIElement;
  stack?: Error;
}
interface AsyncProps<T> {
  promise?: () => AsyncPromResponse;
  componentPromise?: () => AsyncPromResponse;
  fallback?: UIElement;
  fallbackComponent?: UIElement<T>;
  errorComponent?: UIElement<T>;
}
const getPromise = (k: AsyncProps<any>) => k.promise || k.componentPromise;
export class AsyncComponent extends Component<AsyncProps<any>, AsyncState> {
  declare state: AsyncState;
  declare props: AsyncProps<any>;
  componentDidMount() {
    this._init();
  }
  componentDidUpdate(prevProps: Props<AsyncProps<any>>) {
    const prevPromise = prevProps && getPromise(prevProps);
    const currPromise = getPromise(this.props);
    if (prevPromise === currPromise) return;

    this._init();
  }
  _init(): void {
    this.setState({inProgress: true});
    const prom = getPromise(this.props);

    prom()
      .then((component: UIElement) => {
        prom === getPromise(this.props) &&
          this.setState({render: component, inProgress: false, error: false});
      })
      .catch((x: Error) => {
        console.error("AsyncComponent:", x);
        this.setState({error: true, inProgress: false, stack: x});
      });
  }
  render(props: AsyncComponent["props"], state: AsyncComponent["state"]) {
    if (state.inProgress)
      return (
        createElementIfNeeded(props.fallback || props.fallbackComponent) ||
        "Loading"
      );
    if (state.error)
      return (
        createElementIfNeeded(props.errorComponent, {
          stack: this.state.stack,
        }) || "An Error Occured"
      );
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
