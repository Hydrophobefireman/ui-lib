import {Component, enqueueRender} from "./component";
import type {ConsumerCallback, Context, ContextProvider} from "./types/index";

import {$push} from "./util";
import {Fragment} from "./constants";
import {createElement as h} from "./create_element";

let contextId = 0;
interface ProviderProps<T> {
  value: T;
  deopt?: boolean;
}
export function createContext<T>(def: T): Context<T> {
  const $id = "$" + contextId++;

  class Provider extends Component<ProviderProps<T>> {
    _subs: Component[];
    _o: {[id: string]: Provider};
    constructor(props: ProviderProps<T>, context: any) {
      super(props, context);
      this._subs = [];
      this._o = {[$id]: this};
    }
    getChildContext() {
      return this._o;
    }
    shouldComponentUpdate(p: ProviderProps<T>) {
      this.props.deopt &&
        p.value !== this.props.value &&
        this._subs.some((x) => enqueueRender(x));
      return true;
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
  function Consumer(props: {children?: ConsumerCallback<T>}, context?: T) {
    const children = props.children;
    if (typeof children === "function") {
      return children(context);
    }
    return (children as any)[0](context);
  }

  return Consumer;
}

export function isProvider(p: any): p is ContextProvider {
  return typeof p.getChildContext === "function";
}
