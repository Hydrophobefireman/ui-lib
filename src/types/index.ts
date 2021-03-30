import { Component } from "../component";
export interface RefType<T> {
  current: T;
}

export interface VNode<P = {}, R = any> {
  type?: string | ComponentType<P>;
  // json injection prevention
  constructor: undefined;
  props: Props<P>;
  key: any;
  // ref
  ref: ((val: R) => void) | RefType<R>;
  // dom rendered can be `Element` or `Text`
  _dom: UIElement;
  // normalized props.children
  _children: (VNode | null)[];
  // instance of the component that rendered this vnode
  _component: Component<P>;
  // these are returned by function/class components
  _renders: VNode<any>;
  // parentDom node -> to call append child on if we can not reorder
  _parentDom: HTMLElement;
  // used to track reused VNodes
  _used: boolean;
}
export type ComponentProps<
  C extends ComponentType<any> | keyof JSX.IntrinsicElements
> = C extends ComponentType<infer P>
  ? P
  : C extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[C]
  : never;

export type EventListenerDict = JSX.DOMEvents<EventTarget>;
export type createElementPropType<P> = Props<P> | null;
export interface ComponentType<P = {}>
  extends ComponentConstructor<P>,
    FunctionComponent<P> {
  contextType?: Context;
}

export interface ComponentConstructor<P = {}> {
  new (props: Props<P>, context: any): Component<P>;
  prototype: Component<P>;

  getDerivedStateFromProps?(
    props: Readonly<object>,
    state: Readonly<object>
  ): object | null;
}
export interface FunctionComponent<P = {}> {
  (props: Props<P>, context?: any): ComponentChild;
}

export type setStateArgType<P, S, K extends keyof S> =
  | ((
      prevState: Readonly<S>,
      props: Readonly<P>
    ) => Pick<S, K> | Partial<S> | null)
  | (Pick<S, K> | Partial<S> | null);

export type Props<P> = Readonly<
  { children?: ComponentChildren } & JSX.DOMEvents<EventTarget> &
    JSX.HTMLAttributes &
    Record<string, any> &
    P
>;
export type ComponentChild =
  | VNode<any>
  | string
  | number
  | boolean
  | null
  | undefined;
export type ComponentChildren = ComponentChild[];

export interface UIElement extends HTMLElement {
  _events?: Partial<Record<keyof JSX.DOMEvents<any>, JSX.EventHandler<any>>>;
  _VNode?: VNode;
  data?: string | number;
}

export interface VNodeHost extends HTMLElement {
  _hosts?: VNode;
}
export type DiffMeta = {
  depth: number;
  batch: DOMOps[];
  isSvg: boolean;
  context: { [id: string]: ContextProvider };
  contextValue?: any;
  provider?: ContextProvider;
  next?: UIElement;
};

export interface ConsumerCallback<T> {
  (value: T): ComponentChild;
}
export interface ContextConsumer<T> {
  (
    props: { children?: ConsumerCallback<T> | [ConsumerCallback<T>] },
    context: T
  ): ComponentChild;
}

export interface ContextProvider extends Component<{ value: any }> {
  getChildContext(): { [id: string]: Context };
  add(c: Component): void;
}

export interface ContextProviderConstructor
  extends ComponentConstructor<{ value: any }> {
  new (p: Props<{ value: any }>): ContextProvider;
  prototype: ContextProvider;
}

export interface Context<T = unknown> {
  $id: string;
  def: T;
  Consumer: ContextConsumer<T>;
  Provider: ContextProviderConstructor;
}

export interface HookInternal {
  currentComponent: Component;
}

export interface DOMOps {
  node: UIElement;
  action:
    | 1 // BATCH_MODE_SET_ATTRIBUTE | BATCH_MODE_REMOVE_ATTRIBUTE
    | 2 // BATCH_MODE_REMOVE_ELEMENT
    | 3 // BATCH_MODE_SET_STYLE
    | 4 // BATCH_MODE_PLACE_NODE
    | 5 //  BATCH_MODE_SET_SVG_ATTRIBUTE
    | 6 // BATCH_MODE_REMOVE_ATTRIBUTE_NS
    | 7; // BATCH_MODE_REMOVE_POINTERS
  refDom?: HTMLElement;
  VNode?: VNode;
  attr?: string;
  value?: any;
}

type ReadonlyVNodeProps =
  | "constructor"
  | "type"
  | "props"
  | "key"
  | "ref"
  | "_children";
export type WritableProps = Exclude<keyof VNode, ReadonlyVNodeProps>;

export type Renderable<T extends any = ComponentType | VNode | string> =
  | T
  | (() => T);
