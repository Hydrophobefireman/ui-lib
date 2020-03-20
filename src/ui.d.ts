declare class Component {
  props: {};
  context: {};
  state: {};
  constructor(props: {}, context: {});
  render(props: Component["props"], state: Component["state"]): any;
  componentWillMount?(): any;
  componentDidMount?(): any;
  shouldComponentUpdate?(): boolean;
  componentWillUpdate?(): any;
  componentDidUpdate?(): any;
  componentWillUnmount?(): any;
}

export type UiComponent = Component;
export type vNode = {
  type: string | Function;
  props?: { children: Array<UiComponent | vNode>; [key: string]: any };
  _children?: (vNode | null)[];
  events?: { [event: string]: (e: Event) => any };
  _reorder?: boolean;
  _dom?: UiNode;
  key?: string;
  _component?: UiComponent;
  _prevVnode?: vNode;
  _nextDomNode?: UiNode;
  _prevDomNode?: UiNode;
  __uAttr: vNode;
};
export interface UiElement extends HTMLElement {
  _listeners?: { [event: string]: (e: Event) => any };
  _vNode?: vNode;
  _prevVnode?: vNode;
  _component?: UiComponent;
  _currentProps?: {};
}

export interface UiNode extends UiElement, Text {}
export type lifeCycleMethod =
  | "componentWillMount"
  | "componentDidMount"
  | "componentWillUnmount"
  | "shouldComponentUpdate"
  | "componentWillUpdate"
  | "componentDidUpdate";
export type keyedChildren = [{ [index: number]: vNode }, Array<vNode>];
type functionReturningVnode = (props: any) => vNode;
export type createElementArgType =
  | string
  | functionReturningVnode
  | UiComponent;
