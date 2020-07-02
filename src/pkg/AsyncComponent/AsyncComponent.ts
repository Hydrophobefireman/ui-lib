import { ComponentType, Props, VNode } from "../../types/index";

import { Component } from "../../component";
import { createElementIfNeeded } from "../common";
import { flattenArray } from "../../util";

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
    return createElementIfNeeded(
      state.render,
      _objectWithoutKeys(props, [
        "fallback",
        "fallbackComponent",
        "promise",
        "componentPromise",
      ])
    );
  }
}

function _objectWithoutKeys<T = {}>(obj: T, propArr: (keyof T)[]) {
  propArr = (flattenArray([propArr] as (keyof T)[][]) as any) as (keyof T)[];
  const ret = {} as T;
  for (const i in obj) {
    if (propArr.indexOf(i) === -1) {
      ret[i] = obj[i];
    }
  }
  return ret;
}
