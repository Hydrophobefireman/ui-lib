import {
  ComponentConstructor,
  ContextConsumer,
  ContextProvider,
  FunctionComponent,
  RefType,
} from "./api";

export type IVNodeType<P = {}> = ComponentConstructor<P> | FunctionComponent<P>;

export interface UIElement extends HTMLElement {
  _events?: Partial<Record<keyof JSX.DOMEvents<any>, JSX.EventHandler<any>>>;
  _VNode?: VNode;
  data?: string | number;
}

export interface VNode<P = {}, R = any, T = IVNodeType<P> | string> {
  type?: T;
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
  _component: import("../component").Component<P>;
  // these are returned by function/class components
  _renders: VNode<any>;
  // parentDom node -> to call append child on if we can not reorder
  _parentDom: HTMLElement;
  // used to track reused VNodes
  _used: boolean;
}

export type ComponentChild<
  T = VNode | string | number | boolean | null | undefined
> = T;

export type ComponentChildren<T = any> = ComponentChild<T>[];

export type Props<P, T = any> = Readonly<
  { children?: ComponentChildren<T> } & JSX.DOMEvents<EventTarget> &
    JSX.HTMLAttributes &
    Record<string, any> &
    P
>;

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

export type createElementPropType<P> = Props<P> | null;

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

export type DiffMeta = {
  depth: number;
  batch: DOMOps[];
  isSvg: boolean;
  context: { [id: string]: ContextProvider };
  contextValue?: any;
  provider?: ContextProvider;
  next?: UIElement;
};

type ReadonlyVNodeProps =
  | "constructor"
  | "type"
  | "props"
  | "key"
  | "ref"
  | "_children";
export type WritableProps = Exclude<keyof VNode, ReadonlyVNodeProps>;

export type setStateArgType<P, S, K extends keyof S> =
  | ((
      prevState: Readonly<S>,
      props: Readonly<P>
    ) => Pick<S, K> | Partial<S> | null)
  | (Pick<S, K> | Partial<S> | null);

export interface HookInternal {
  currentComponent: import("../component").Component;
}
export {};
