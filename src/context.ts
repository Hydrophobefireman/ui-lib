import {Component, enqueueRender} from "./component.js";
import type {ConsumerCallback, Context} from "./types/index.js";

import {$push} from "./util.js";
import {Fragment} from "./constants.js";
import {createElement as h} from "./create_element.js";

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
    componentWillUnmount() {
      this._subs.length = 0;
    }
    shouldComponentUpdate(p: ProviderProps<T>) {
      // Changed values must reach subscribers even when an intermediate
      // component blocks normal child rendering. `deopt` remains accepted for
      // backwards compatibility but is no longer needed to enable this.
      if (!Object.is(p.value, this.props.value)) {
        const subs = this._subs.slice();
        for (let i = 0; i < subs.length; i++) {
          if (this._subs.indexOf(subs[i]) > -1) enqueueRender(subs[i]);
        }
      }
      return true;
    }
    add(c: Component) {
      $push(this._subs, c);
      const subscriptions: Provider[] =
        (c as any).__contextProviders ||
        ((c as any).__contextProviders = []);
      if (subscriptions.indexOf(this as any) > -1) return;
      subscriptions.push(this as any);
      if (!(c as any).__contextUnmountAttached) {
        (c as any).__contextUnmountAttached = true;
        const old = c.componentWillUnmount;
        c.componentWillUnmount = function () {
          const providers: Provider[] = (c as any).__contextProviders || [];
          for (let i = providers.length - 1; i >= 0; i--) {
            providers[i].remove(c);
          }
          (c as any).__contextProviders = [];
          old && old.call(c);
        };
      }
    }
    remove(c: Component) {
      const index = this._subs.indexOf(c);
      if (index > -1) this._subs.splice(index, 1);
      const subscriptions: Provider[] = (c as any).__contextProviders;
      if (subscriptions) {
        const subIndex = subscriptions.indexOf(this as any);
        if (subIndex > -1) subscriptions.splice(subIndex, 1);
      }
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
