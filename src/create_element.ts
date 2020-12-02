import {
  ComponentChild,
  ComponentChildren,
  VNode,
  createElementPropType,
} from "./types/index";
import { EMPTY_ARRAY, EMPTY_OBJ, Fragment, NULL_TYPE } from "./constants";
import { flattenArray, objectWithoutKeys } from "./util";

import { plugins } from "./config";

export const skipProps: (keyof VNode)[] = ["key", "ref"];

/** return a VNode
 * @example
 * // jsx
 * function App() {
 *  return <p>Hello World</p>
 * }
 * // js
 * function App() {
 *  return createElement("p",null,"Hello World")
 * }
 * it supports the new auto import introduced in babel and normalizes the children argument
 */
export function createElement<P = {}, R = any>(
  type: VNode<P>["type"],
  props?: createElementPropType<P>,
  ...children: ComponentChildren | ComponentChildren[]
): VNode<P> | null;
export function createElement<P = {}, R = any>(
  type: VNode<P>["type"],
  props?: createElementPropType<P> | null
): VNode<P> | null {
  if (type == null || typeof type == "boolean") return null;

  if (props == null) {
    (props as any) = EMPTY_OBJ;
  }

  let children: ComponentChildren[];
  // don't pass ref & key to the component
  const ref: R = props.ref;
  const key = props.key;
  // TODO remove any
  (props as any) = objectWithoutKeys(props, skipProps);

  // children provided as the extra args are used
  // mark props.children as empty_arr so we know the no child was passed
  let _children: any[];
  if (props.children != null) {
    _children = flattenArray([props.children]);
  } else if ((children = createElementChildren(arguments)).length) {
    _children = flattenArray(children);
  }
  (props as any).children = _children;
  const _vnode = getVNode<P, R>(type, props, key, ref);
  plugins.createElement(_vnode);
  return _vnode;
}

export function coerceToVNode(VNode: ComponentChild | VNode): VNode {
  // don't render anything to the dom, just leave a comment
  if (VNode == null || typeof VNode === "boolean") {
    return createElement(NULL_TYPE);
  }
  if (typeof VNode === "string" || typeof VNode === "number") {
    return getVNode(null, String(VNode) as any);
  }
  // a function returned an array instead of a fragment, normalize it
  if (Array.isArray(VNode)) {
    return createElement(Fragment, null, VNode);
  }
  // VNode exists, clone
  if ((VNode as VNode)._used) {
    const vn = getVNode(
      (VNode as VNode).type,
      (VNode as VNode).props,
      (VNode as VNode).key
    );
    return vn;
  }
  (VNode as VNode)._used = true;
  return VNode as VNode;
}
/** return a flat array of children and normalize them */
export function flattenVNodeChildren<P>(VNode: VNode<P>): VNode[] {
  let c = VNode.props.children;
  // even if we are creating an empty fragment
  // we will still render a null child (`c`)
  // as it will serve as a memory for where the fragment's
  // future children should be
  const nullChildren = c == null;
  if (VNode.type !== Fragment) {
    if (nullChildren) return [];
  } else {
    if (c && !c.length) c = null;
  }
  return flattenArray<unknown>([c], coerceToVNode) as VNode[];
}

export function getVNode<P, R>(
  type: VNode<P, R>["type"],
  props: createElementPropType<P>,
  key?: any,
  ref?: any
): VNode<P, R> {
  return {
    type,
    props,
    key,
    ref,
    _dom: null,
    _children: null,
    _component: null,
    _renders: null,
    _parentDom: null,
    _used: false,
    constructor: undefined,
  };
}

export function createElementChildren(args: IArguments) {
  return EMPTY_ARRAY.slice.call(args, 2);
}
