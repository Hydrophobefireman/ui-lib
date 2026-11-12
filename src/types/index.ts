import type {Component} from "../component.js";
import type {UILibEventTarget} from "./jsx.js";
import type {
  BATCH_MODE_CLEAR_POINTERS,
  BATCH_MODE_PLACE_NODE,
  BATCH_MODE_REMOVE_ATTRIBUTE,
  BATCH_MODE_REMOVE_ATTRIBUTE_NS,
  BATCH_MODE_REMOVE_ELEMENT,
  BATCH_MODE_REMOVE_SVG_ATTRIBUTE,
  BATCH_MODE_SET_ATTRIBUTE,
  BATCH_MODE_SET_STYLE,
  BATCH_MODE_SET_SVG_ATTRIBUTE,
  RENDER_MODE_CLIENT,
  RENDER_MODE_HYDRATE,
  RENDER_MODE_SERVER,
} from "../constants.js";
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

export type EventListenerDict = JSX.DOMEvents<UILibEventTarget>;
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
  {children?: ComponentChildren} & JSX.DOMEvents<UILibEventTarget> &
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

export interface EventHandlerRecord {
  bubble?: JSX.EventHandler<any>;
  capture?: JSX.EventHandler<any>;
  bubbleProxy?: EventListener;
  captureProxy?: EventListener;
}
export interface UIElement extends HTMLElement {
  _events?: Record<string, EventHandlerRecord>;
  _VNode?: VNode;
  data?: string | number;
  _nodeContext?: any;
}

export interface VNodeHost extends HTMLElement {
  _hosts?: VNode;
}

export interface DocElement {
  constructor(name: string);
  setAttribute(key: string, value: string): void;
  removeAttribute(key: string): void;
  repr(): string;
  appendChild(el: DocElement): void;
  removeChild(el: DocElement): void;
  insertBefore(el: DocElement, ref: DocElement | null): void;
}

export interface Doc {
  head: DocElement;
  body: DocElement;
  documentElement: DocElement;
  get innerHTML(): string;
  set innerHTML(v: string);
  createElement(name: string): DocElement;
  createElementNS(ns: string, name: string): DocElement;
  createTextNode(n: string): DocElement;
  createComment(n: string): DocElement;
}

export type DiffMeta = {
  depth: number;
  isSvg: boolean;
  mode:
    | typeof RENDER_MODE_CLIENT
    | typeof RENDER_MODE_SERVER
    | typeof RENDER_MODE_HYDRATE;
  context: {[id: string]: ContextProvider};
  contextValue?: any;
  provider?: ContextProvider;
  next?: UIElement;
};

export interface ConsumerCallback<T> {
  (value: T): ComponentChild;
}
export interface ContextConsumer<T> {
  (
    props: {children?: ConsumerCallback<T> | [ConsumerCallback<T>]},
    context: T
  ): ComponentChild;
}

export interface ContextProvider<T = any> extends Component<{value: T}> {
  getChildContext(): {[id: string]: Context};
  add(c: Component): void;
  remove(c: Component): void;
}
export interface ContextProviderConstructor<P = {}> {
  new (props: P, context: any): ContextProvider<P>;
  prototype: ContextProvider<P>;
}

export interface Context<T = unknown> {
  $id: string;
  def: T;
  Consumer: ContextConsumer<T>;
  Provider: ContextProviderConstructor<{value: T}>;
}

export interface HookInternal {
  currentComponent: Component;
}

export interface DOMOps {
  node: UIElement;
  action:
    | typeof BATCH_MODE_SET_ATTRIBUTE
    | typeof BATCH_MODE_REMOVE_ATTRIBUTE
    | typeof BATCH_MODE_REMOVE_ELEMENT
    | typeof BATCH_MODE_SET_STYLE
    | typeof BATCH_MODE_PLACE_NODE
    | typeof BATCH_MODE_SET_SVG_ATTRIBUTE
    | typeof BATCH_MODE_REMOVE_ATTRIBUTE_NS
    | typeof BATCH_MODE_CLEAR_POINTERS
    | typeof BATCH_MODE_REMOVE_SVG_ATTRIBUTE;
  refDom?: HTMLElement;
  VNode?: VNode;
  attr?: string;
  value?: any;
  isSSR?: boolean;
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

export interface CustomWindow extends Omit<Partial<Window>, "document"> {
  document: Doc;
}
