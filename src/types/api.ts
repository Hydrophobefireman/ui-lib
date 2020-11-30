import { ComponentChild, Context, IVNodeType, Props } from "./internal";

type Component<P = {}> = import("../component").Component<P>;

export interface RefType<T> {
  current: T;
}

export interface FunctionComponent<P = {}, T = any, C = any> {
  (props: Props<P, T>, context?: C): ComponentChild<T>;
  contextType?: Context<C>;
}
export interface ComponentConstructor<P = {}, T = any> {
  new (props: Props<P, T>, context: any): Component<P>;
  prototype: Component<P>;
  contextType?: Context;
  getDerivedStateFromProps?(
    props: Readonly<object>,
    state: Readonly<object>
  ): object | null;
}

export interface ConsumerCallback<T> {
  (value: T): ComponentChild;
}

export interface ContextConsumer<T> extends FunctionComponent<{}, T> {}

export interface ContextProvider extends Component<{ value: any }> {
  getChildContext(): { [id: string]: Context };
  add(c: Component): void;
}

export type ComponentProps<
  C extends IVNodeType<{}> | keyof JSX.IntrinsicElements
> = C extends IVNodeType<infer P>
  ? P
  : C extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[C]
  : never;

export type EventListenerDict = JSX.DOMEvents<EventTarget>;
export {};
