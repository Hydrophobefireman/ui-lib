import type {Props, Renderable as UIElement} from "../../types/index.js";

import {Component} from "../../component.js";
import {createElementIfNeeded} from "../common.js";
import {objectWithoutKeys} from "../../util.js";

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
  private _requestId = 0;
  componentDidMount() {
    this._init();
  }
  componentDidUpdate(prevProps: Props<AsyncProps<any>>) {
    const prevPromise = prevProps && getPromise(prevProps);
    const currPromise = getPromise(this.props);
    if (prevPromise === currPromise) return;

    this._init();
  }
  componentWillUnmount() {
    // Invalidate any in-flight request; no stale state/console output.
    this._requestId++;
  }
  private _fail(id: number, error: any) {
    if (id !== this._requestId) return;
    console.error("AsyncComponent:", error);
    this.setState({
      error: true,
      inProgress: false,
      stack: error,
      render: null,
    });
  }
  _init(): void {
    const id = ++this._requestId;
    this.setState({
      inProgress: true,
      error: false,
      stack: null,
      render: null,
    });

    const factory = getPromise(this.props);
    let request: AsyncPromResponse;
    try {
      if (typeof factory !== "function") {
        throw new Error(
          "AsyncComponent: a promise or componentPromise factory is required"
        );
      }
      request = factory();
      if (!request || typeof request.then !== "function") {
        throw new Error("AsyncComponent: promise factory did not return a promise");
      }
    } catch (error) {
      this._fail(id, error);
      return;
    }

    request.then(
      (component: UIElement) => {
        // Token (not factory identity) distinguishes reused factories in
        // A -> B -> A sequences and rejects superseded results.
        if (id !== this._requestId) return;
        this.setState({
          render: component,
          inProgress: false,
          error: false,
          stack: null,
        });
      },
      (error: any) => this._fail(id, error)
    );
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
        "errorComponent",
      ])
    );
  }
}
