import { JSXInternal } from "./jsx";
import { Component } from "../component";

export type RenderedDom = UIElement;
export interface VNode<P = {}, R = any> {
  type?: string | ComponentType<P>;
  // json injection prevention
  constructor: undefined;
  props: Props<P>;
  key: any;
  // ref
  ref: ((val: R) => void) | { current: R };
  // dom rendered can be `Element` or `Text`
  _dom: RenderedDom;
  // normalized props.children
  _children: (VNode | null)[];
  // instance of the component that rendered this vnode
  _component: Component<P>;
  // these are returned by function/class components
  _renders: VNode<any>;
  // passes the depth arg to the component
  _depth: number;
  // parentDom node -> to call append child on if we can not reorder
  _parentDom: HTMLElement;
}

export type EventListenerDict = JSXInternal.DOMEvents<EventTarget>;
export type createElementPropType<P> = Props<P> | null;
export type ComponentType<P = {}> =
  | ComponentConstructor<P>
  | FunctionComponent<P>;

export interface ComponentConstructor<P = {}> {
  new (props: Props<P>): Component<P>;
  prototype: Component<P>;

  getDerivedStateFromProps?(
    props: Readonly<object>,
    state: Readonly<object>
  ): object | null;
}
export interface FunctionComponent<P = {}> {
  (props: Props<P>): VNode<any> | null;
}

export type setStateArgType<P, S, K extends keyof S> =
  | ((
      prevState: Readonly<S>,
      props: Readonly<P>
    ) => Pick<S, K> | Partial<S> | null)
  | (Pick<S, K> | Partial<S> | null);

export type Props<P> = Readonly<
  { children?: ComponentChildren } & JSXInternal.DOMEvents<EventTarget> &
    JSXInternal.HTMLAttributes &
    Record<string, any> &
    P
>;
export type ComponentChild =
  | VNode<any>
  | object
  | string
  | number
  | boolean
  | null
  | undefined;
export type ComponentChildren = ComponentChild[] | ComponentChild;

export interface UIElement extends HTMLElement {
  _events?: Partial<
    Record<keyof JSXInternal.DOMEvents<any>, JSXInternal.EventHandler<any>>
  >;
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
  next?: UIElement;
};

export type HookInternal = { currentComponent: Component };

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
  | "_children"
  | "_depth";
export type WritableProps = Exclude<keyof VNode, ReadonlyVNodeProps>;
