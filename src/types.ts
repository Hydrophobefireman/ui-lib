import { JSXInternal } from "./jsx";
export interface ExtendedDocFrag extends DocumentFragment {
  _parent?: UIElement;
}
export interface VNode<P = {}> {
  type?: string | ComponentType<P>;
  // json injection prevention
  __self: VNode<P>;
  props: Props<P>;
  // record of events normalized from props
  events: EventListenerDict;
  //
  key: any;
  //
  ref: any;
  // dom rendered can be `Element` or `Text`
  _dom: UIElement;
  // normalized props.children
  _children: (VNode | null)[];
  // instance of the component that rendered this vnode
  _component: Component<P>;
  // if our class/function/fragment returns multiple dom, collect them here
  _FragmentDomNodeChildren: (UIElement | Text)[];
  // // document fragment for when our component returns an array of children
  // _docFrag: DocumentFragment;
  // these are returned by function/class components
  _renders: VNode<any>;
  // which class component return this vnode
  _renderedBy: VNode<any>;
  // next DOM node's vnode pointer
  _nextSibDomVNode: VNode<any>;
  // previous DOM node's vnode pointer
  _prevSibDomVNode: VNode<any>;
  // passes the depth arg to the component
  _depth: number;
  // parentDom node -> to call append child on if we can not reorder
  _parentDom: Node;
  //  the fragment parent VNode this VNode is a child of
  _fragmentParent: VNode;
}

export type EventListenerDict = JSXInternal.DOMEvents<EventTarget>;
export type createElementPropType<P> = Props<P> | null;
export type ComponentType<P = {}> = Component<P> | FunctionComponent<P>;

export interface FunctionComponent<P = {}> {
  (props: Props<P>): VNode<any> | null;
}

export type setStateArgType<P, S, K extends keyof S> =
  | ((
      prevState: Readonly<S>,
      props: Readonly<P>
    ) => Pick<S, K> | Partial<S> | null)
  | (Pick<S, K> | Partial<S> | null);

export interface Component<P = {}, S = {}> {
  props: Props<P>;
  state: S;
  _nextState?: S;
  _oldState?: S;
  _depth?: number;
  _VNode?: VNode<P>;
  base?: UIElement | null;
  componentWillMount?(): void;
  componentDidMount?(): void;
  componentWillUnmount?(): void;
  componentWillReceiveProps?(nextProps: Readonly<P>): void;
  shouldComponentUpdate?(
    nextProps: Readonly<P>,
    nextState: Readonly<S>
  ): boolean;
  componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>): void;
  // getSnapshotBeforeUpdate?(oldProps: Readonly<P>, oldState: Readonly<S>): any;
  componentDidUpdate?(
    previousProps: Readonly<P>,
    previousState: Readonly<S>
  ): void;
  componentDidCatch?(error: any): void;
  render(props?: Props<P>, state?: Readonly<S>): ComponentChild;
  setState<K extends keyof S>(state: setStateArgType<P, S, K>): void;
  forceUpdate(cb?: any): void;
  _dirty?: boolean;
  _lastLifeCycleMethod?:
    | "componentWillMount"
    | "componentDidMount"
    | "componentWillUnmount"
    | "shouldComponentUpdate"
    | "componentWillUpdate"
    | "componentDidUpdate";
}

export type Props<P> = Readonly<
  P & { children?: ComponentChildren } & JSXInternal.DOMEvents<EventTarget> &
    JSXInternal.HTMLAttributes &
    Record<string, any>
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
  // _children?: VNode<any> | null;
  _listeners?: Record<string, (e: Event) => void>;
  _VNode: VNode;
  data?: string | number;
}

export type DiffMeta = { depth: number };
