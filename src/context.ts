import { Component, enqueueRender } from "./component";
import type {
  ConsumerCallback,
  Context,
  ContextProvider,
  Props,
} from "./types/index";

import { $push } from "./util";
import { Fragment } from "./constants";
import { h } from "./index";

let contextId = 0;
export function createContext<T>(def: T): Context<T> {
  const $id = "$" + contextId++;

  class Provider extends Component<{ value: any }> {
    _subs: Component[];
    _o: { [id: string]: Provider };
    constructor(props: Props<{ value: any }>, context: any) {
      super(props, context);
      this._subs = [];
      this._o = { [$id]: this };
    }
    getChildContext() {
      return this._o;
    }
    shouldComponentUpdate(p: Props<{}>) {
      return (
        (p.value !== this.props.value &&
          this._subs.some((x) => enqueueRender(x))) ||
        true
      );
    }
    add(c: Component) {
      const s = this._subs;
      $push(s, c);
      const old = c.componentWillUnmount;
      c.componentWillUnmount = () => {
        s.splice(s.indexOf(c), 1);
        old && old.call(c);
      };
    }
    render() {
      return h(Fragment, null, this.props.children);
    }
  }

  const Consumer = createConsumer<T>();
  const context = {
    $id,
    Consumer,
    Provider: Provider as any,
    def,
  };
  (Consumer as any).contextType = context;
  return context;
}

function createConsumer<T>() {
  function Consumer(props: { children: [ConsumerCallback<T>] }, context: T) {
    const children = props.children;
    if (typeof children === "function") {
      return (children as ConsumerCallback<T>)(context);
    }
    return children[0](context);
  }

  return Consumer;
}

export function isProvider(p: any): p is ContextProvider {
  return typeof p.getChildContext === "function";
}
