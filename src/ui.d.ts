export type UiComponent = import("./component").default;

export type vNode = {
  type: string | Function;
  props?: { children: Array<UiComponent, vNode>; [key: string]: any };
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
  _oldVnode?: vNode;
  _component?: UiComponent;
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
