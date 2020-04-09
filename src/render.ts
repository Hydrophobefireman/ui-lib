import {
  createElement,
  Fragment,
  flattenVNodeChildren,
} from "./create_element";
import {
  VNode,
  UIElement,
  ComponentChild,
  ComponentChildren,
  Props,
} from "./types";

import { diff } from "./diff/index";

import { processMountsQueue } from "./lifeCycleCallbacks";
export function render(VNode: VNode, parentDom: UIElement) {
  const normalizedVnode = createElement(Fragment, null, VNode);
  normalizedVnode._parentDom = parentDom;
  if (parentDom.hasChildNodes()) {
    /** We have some content in the parent dom.. could  */
    return hydrate(normalizedVnode, parentDom);
  }
  diff(normalizedVnode, null, parentDom, false, { depth: 0 });
  processMountsQueue();
}

export function hydrate(VNode: VNode, parentDom: UIElement) {
  const normalizedVnode = createElement(
    Fragment,
    null,
    getVNodeChildrenFromDom(parentDom)
  );
  normalizedVnode._parentDom = parentDom;
  normalizedVnode._children = flattenVNodeChildren(normalizedVnode);
  const c = normalizedVnode._children;
  normalizedVnode._FragmentDomNodeChildren = c.map(getDomORNullFromVNode);
  diff(VNode, normalizedVnode, parentDom, false, { depth: 0 });
  processMountsQueue();
}

function getVNodeFromPreExistingDom(dom: Node): ComponentChild | string {
  const nm = dom.nodeName;
  if (nm === "#comment" || nm === "script") {
    return;
  }
  if (dom instanceof Text) return dom.nodeValue;
  if (dom instanceof HTMLElement) {
    const VNode = createElement(
      dom.tagName,
      getDomAttributesAsProps(dom.attributes),
      getVNodeChildrenFromDom(dom)
    );
    VNode._children = flattenVNodeChildren(VNode);
    (dom as UIElement)._VNode = VNode;
    VNode._dom = dom as UIElement;
    return VNode;
  }
}

function getDomAttributesAsProps(attributes: NamedNodeMap): Props<any> {
  const props = {};
  const length = attributes.length;
  for (let i = 0; i < length; i++) {
    const attr = attributes[i];
    const key = attr.name;
    const value = attr.value;
    props[key] = value;
  }
  return props;
}
function getVNodeChildrenFromDom(dom: HTMLElement): ComponentChildren {
  return Array.from(dom.childNodes).map(getVNodeFromPreExistingDom);
}

function getDomORNullFromVNode(child: VNode | null): UIElement | Text | null {
  if (child == null) return null;
  return child._dom;
}
