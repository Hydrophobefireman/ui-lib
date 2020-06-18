import { EMPTY_OBJ } from "./constants";
import { VNode, UIElement, WritableProps } from "./types/index";

export function getClosestDom(VNode: VNode): UIElement {
  if (!VNode) return;
  const dom = VNode._dom;
  if (dom) return dom;
  const fragDom = VNode._FragmentDomNodeChildren;
  if (fragDom) {
    return _getDom(fragDom);
  }
}

function _getDom(fDom: VNode["_FragmentDomNodeChildren"]): UIElement {
  for (let i = 0; i < fDom.length; i++) {
    const e = fDom[i];
    if (Array.isArray(e)) {
      const next = _getDom(e);
      if (next) return next;
      continue;
    }
    if (e) return e as UIElement;
  }
}
export function updatePointers(newVNode: VNode) {
  const dom = newVNode._dom;
  let sn = newVNode._nextSibDomVNode;

  if (sn == null) {
    const nextSib = dom.nextSibling as UIElement;

    if (nextSib != null) {
      sn = nextSib._VNode;
    }
  }

  copyPropsOverEntireTree(sn, "_prevSibDomVNode", newVNode);

  copyPropsOverEntireTree(newVNode, "_nextSibDomVNode", sn);

  let pn = newVNode._prevSibDomVNode;

  if (pn == null) {
    const prevSib = dom.previousSibling as UIElement;

    if (prevSib != null) {
      pn = prevSib._VNode;
    }
  }

  copyPropsOverEntireTree(pn, "_nextSibDomVNode", newVNode);

  copyPropsOverEntireTree(newVNode, "_prevSibDomVNode", pn);
}

export function copyPropsOverEntireTree(
  VNode: VNode,
  propVal: WritableProps,
  val: any
) {
  copyPropsDownwards(VNode, propVal, val);
  copyPropsUpwards(VNode, propVal, val);
}

const replaceOtherProp = {
  _dom: "_FragmentDomNodeChildren",
  _FragmentDomNodeChildren: "_dom",
};

function updateInternalVNodes(
  VNode: VNode,
  prop: WritableProps,
  val: any,
  nextGetter: "_renders" | "_renderedBy"
) {
  let next = VNode;

  const replace = replaceOtherProp[prop];

  while (next) {
    if (replace) {
      next[replace] = null;
    }
    next[prop] = val;

    next = next[nextGetter];
  }
}

const propPSD = "_prevSibDomVNode";
const propNSD = "_nextSibDomVNode";
/**
 * copy random dom data that stays static during the diff
 * @param target target VNode - most likely newVNode of diff function
 * @param source source VNode - most likely oldVNode of diff function
 */
export function copyVNodePointers(newVNode: VNode, oldVNode: VNode) {
  if (oldVNode === EMPTY_OBJ || newVNode == null || oldVNode == null) return;

  const _prevSibDomVNode = oldVNode._prevSibDomVNode;

  const shouldUpdatePrevSibVNodeProps =
    newVNode._prevSibDomVNode == null && _prevSibDomVNode != null;

  if (shouldUpdatePrevSibVNodeProps) {
    copyPropsOverEntireTree(newVNode, propPSD, _prevSibDomVNode);
    copyPropsOverEntireTree(_prevSibDomVNode, propNSD, newVNode);
  }

  const _nextSibDomVNode = oldVNode._nextSibDomVNode;

  const shouldUpdateNextSibVNodeProps =
    newVNode._nextSibDomVNode == null && _nextSibDomVNode != null;

  if (shouldUpdateNextSibVNodeProps) {
    copyPropsOverEntireTree(newVNode, propNSD, _nextSibDomVNode);
    copyPropsOverEntireTree(_nextSibDomVNode, propPSD, newVNode);
  }
}

export function copyPropsUpwards(
  VNode: VNode,
  prop: WritableProps,
  value: any
): void {
  updateInternalVNodes(VNode, prop, value, "_renderedBy");
}

export function copyPropsDownwards(
  VNode: VNode,
  prop: WritableProps,
  value: any
): void {
  updateInternalVNodes(VNode, prop, value, "_renders");
}
