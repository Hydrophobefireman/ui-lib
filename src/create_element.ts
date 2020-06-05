import {
  ComponentType,
  ComponentChildren,
  VNode,
  Props,
  createElementPropType,
  EventListenerDict,
  ComponentChild,
} from "./types";

import { EMPTY_OBJ, flattenArray, isListener } from "./util";

/**
 * Special constant to mark `null` elements
 * @example
 * function App() {
 *  return <div>{someCondition && <div>It's True!</div> }</div>
 * }
 * @description
 * in case `someCondition` is falsey, we will render a comment (`<!--$-->`) in the dom instead
 * this makes it easier for us to detect changes and additions/removals in case of <Fragment>
 * supporting which is the reason this "workaround" exists
 */
export const PlaceHolder: any = {};

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
export function createElement<P = {}>(
  type: ComponentType<P> | string,
  props?: createElementPropType<P> | null,
  ...children: ComponentChildren[]
): VNode<P> | null {
  if (type == null || typeof type === "boolean") return null;

  if (props == null) {
    (props as any) = EMPTY_OBJ;
  }

  // don't pass ref & key to the component
  const ref = props.ref;
  const key = props.key;

  const events: EventListenerDict = typeof type === "string" ? {} : null;

  props = getPropsWithoutSpecialKeysAndInitializeEventsDict(props, events);

  // children provided as the extra args are used
  // mark props.children as empty_arr so we know the no child was passed
  let _children: any[];
  if (children.length && props.children == null) {
    _children = flattenArray(children);
  }
  if (props.children != null) {
    _children = flattenArray([props.children]);
  }
  (props as any).children = _children;
  return getVNode<P>(type, props, events, key, ref);
}

function getVNode<P>(
  type: ComponentType<P> | string,
  props: createElementPropType<P>,
  events?: EventListenerDict,
  key?: any,
  ref?: any
): VNode<P> {
  const VNode: VNode<P> = {
    type: typeof type === "string" ? type.toLowerCase() : type,
    props,
    events,
    key,
    ref,
    _dom: null,
    _children: null,
    _component: null,
    _nextSibDomVNode: null,
    _renders: null,
    _renderedBy: null,
    _prevSibDomVNode: null,
    _FragmentDomNodeChildren: null,
    _parentDom: null,
    _depth: 0,
    __self: null,
  };
  VNode.__self = VNode;
  return VNode;
}

export const Fragment: any = function Fragment(): void {};

const skipProps = { key: 1, ref: 1 };

/** remove any prop if it exists in `skipProps` */

function getPropsWithoutSpecialKeysAndInitializeEventsDict<P>(
  props: createElementPropType<P>,
  events: {}
) {
  const obj = {};
  const shouldAddEvents = events != null;
  for (const i in props) {
    if (skipProps[i] == null) {
      obj[i] = props[i];
      if (shouldAddEvents && isListener(i)) {
        events[i.substr(2).toLowerCase()] = props[i];
      }
    }
  }
  return obj as Props<P>;
}

export function convertToVNodeIfNeeded(VNode: ComponentChild | VNode): VNode {
  // don't render anything to the dom, just leave a comment
  if (VNode == null || typeof VNode === "boolean") {
    return createElement(PlaceHolder);
  }
  if (typeof VNode === "string" || typeof VNode === "number") {
    return getVNode(null, String(VNode) as any);
  }
  // a function returned an array instead of a fragment, normalize it
  if (Array.isArray(VNode)) {
    return createElement(Fragment, null, VNode);
  }
  // VNode exists, clone
  if ((VNode as VNode)._dom != null) {
    const vn = getVNode(
      (VNode as VNode).type,
      (VNode as VNode).props,
      (VNode as VNode).events,
      (VNode as VNode).key,
      null
    );
    return vn;
  }
  return VNode as VNode;
}
/** return a flat array of children and normalize them*/
export function flattenVNodeChildren<P>(VNode: VNode<P>): VNode[] {
  const c = VNode.props.children;
  if (c == null && VNode.type !== Fragment) {
    return [];
  }
  return flattenArray<unknown>([c], convertToVNodeIfNeeded) as VNode[];
}

export function createRef<T>() {
  return { current: null } as { current: T };
}
