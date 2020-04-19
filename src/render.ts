import {
  createElement,
  Fragment,
  // flattenVNodeChildren,
} from "./create_element";
import {
  VNode,
  // UIElement,
  // ComponentChild,
  // ComponentChildren,
  // Props,
  VNodeHost,
} from "./types";

import { diff } from "./diff/index";
// import config from "./config";
import { processMountsQueue, processUpdatesQueue } from "./lifeCycleCallbacks";
import { clearDOM } from "./util";

export function render(VNode: VNode, parentDom: VNodeHost) {
  const normalizedVNode = createElement(Fragment, null, VNode);

  if (parentDom.hasChildNodes() && !parentDom._hosts) {
    /*#__NOINLINE__*/
    clearDOM(parentDom);
  }
  //   /** We have some content in the parent dom.. attempt diffing  */
  //   if (config.eagerlyHydrate) {
  //     return hydrate(normalizedVNode, parentDom);
  //   } else {
  //     clearDOM(parentDom);
  //   }
  // }
  // const oldVNode = parentDom._hosts;
  // clearDOM(parentDom);
  diff(normalizedVNode, parentDom._hosts, parentDom, false, { depth: 0 });
  processMountsQueue();
  processUpdatesQueue();
  parentDom._hosts = VNode;
}

/**@todo fix hydrate */
// function hydrate(VNode: VNode, parentDom: UIElement) {
//   const fauxOldVNode = createElement(
//     Fragment,
//     null,
//     convertChildNodesToVNode(parentDom)
//   );
//   fauxOldVNode._children = flattenVNodeChildren(fauxOldVNode);
//   const c = fauxOldVNode._children;
//   fauxOldVNode._FragmentDomNodeChildren = c.map(
//     (child: VNode | null): UIElement | Text | null => child && child._dom
//   );
//   diff(VNode, fauxOldVNode, parentDom, false, { depth: 0 });
// }

// function createVNodeFromDOM(dom: Node): ComponentChild | string {
//   const nm = dom.nodeName;
//   if (nm === "#comment" || nm === "script" || nm === "style") {
//     return;
//   }
//   if (dom instanceof Text) return dom.nodeValue;
//   if (dom instanceof HTMLElement) {
//     const VNode = createElement(
//       dom.tagName,
//       getDomAttributesAsProps(dom.attributes),
//       convertChildNodesToVNode(dom)
//     );
//     VNode._children = flattenVNodeChildren(VNode);
//     (dom as UIElement)._VNode = VNode;
//     VNode._dom = dom as UIElement;
//     return VNode;
//   }
// }

// function getDomAttributesAsProps(attributes: NamedNodeMap): Props<any> {
//   const props = {};
//   const length = attributes.length;
//   for (let i = 0; i < length; i++) {
//     const attr = attributes[i];
//     const key = attr.name;
//     const value = attr.value;
//     props[key] = value;
//   }
//   return props;
// }
// function convertChildNodesToVNode(dom: HTMLElement): ComponentChildren {
//   return Array.from(dom.childNodes).map(createVNodeFromDOM);
// }
