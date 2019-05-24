/**
 *  @TODO refactor loops and fix variable naming
 */
import { Fragment, toVnode } from "../create-element.js";
import {
  assign,
  flattenArray,
  EMPTY_OBJ,
  EMPTY_ARR,
  appendChild
} from "../util.js";
import { unmountDomTree, runLifeCycle } from "../lifeCycleRunner.js";
import Component from "../component.js";
import { diffDom } from "./dom.js";
import { diffChildren } from "./children.js";
/**
 *
 * @param {import("../ui").UiElement} parentDom
 * @param {import("../ui").vNode} newVnode
 * @param {import("../ui").vNode} oldVnode
 * @param {object} context
 * @param {Array<import("../ui").UiComponent>} mounts
 * @param {import("../ui").UiComponent} previousComponent
 * @param {boolean} force
 * @param {import("../ui").UiNode} oldDom
 
 */
export function diff(
  parentDom,
  newVnode,
  oldVnode,
  context,
  mounts,
  previousComponent,
  force,
  oldDom
) {
  if (
    oldVnode == null ||
    newVnode == null ||
    oldVnode.type !== newVnode.type ||
    oldVnode.key !== newVnode.key
  ) {
    if (oldVnode != null && oldVnode !== EMPTY_OBJ) {
      unmountDomTree(oldVnode._dom);
    }
    if (newVnode == null) {
      return null;
    }
    oldVnode = EMPTY_OBJ;
  }

  const shouldGenerateNewTree = oldVnode === EMPTY_OBJ;

  if (newVnode.__uAttr !== newVnode) {
    return null;
  }
  newVnode._children = flattenArray(
    (newVnode.props && newVnode.props.children) || [],
    Infinity,
    toVnode
  );
  if (newVnode.type !== Fragment && oldVnode.type !== Fragment) {
    if (typeof newVnode.type === "function") {
      /**
       * @type {import("../ui").lifeCycleMethod}
       */
      let lifeCycle = "componentWillMount";
      if (newVnode._component != null && newVnode._component._didMount) {
        lifeCycle = "componentWillUpdate";
      }
      const node = instantiateComponent(
        newVnode,
        oldVnode,
        context,
        mounts,
        parentDom,
        lifeCycle
      );

      const dom = diff(
        parentDom,
        node,
        oldVnode,
        context,
        mounts,
        newVnode._component,
        force,
        oldDom
      );
      newVnode._dom = node._dom;
      dom._vnode = newVnode;
      return dom;
    } else {
      diffDom(
        newVnode,
        oldVnode,
        oldDom,
        shouldGenerateNewTree,
        context,
        mounts
      );
    }
  }
  let childArr;

  const newDom = newVnode._dom;
  childArr = diffChildren(
    newVnode,
    oldVnode._children || EMPTY_ARR,
    parentDom,
    context,
    mounts,
    previousComponent
  );
  if (newVnode._component != null) {
    newVnode._component.base = newDom;
  }
  const cm = newVnode._component;
  if (cm != null) {
    cm.parent = parentDom;
  }
  if (childArr != null) {
    if (newDom == null && newVnode.type === Fragment) {
      for (const child of childArr) {
        appendChild(parentDom, child);
      }
      return childArr;
    }
    for (const child of childArr) {
      if (newDom !== child) {
        appendChild(newDom, child);
      }
    }
  }
  if (newDom != null) {
    newDom._vNode = newVnode;
    newDom._component = newVnode._component;
    if (parentDom != null) {
      appendChild(parentDom, newDom);
    }
  }

  if (cm != null && cm.__currentLifeCycle === "componentWillUpdate") {
    runLifeCycle(cm, "componentDidUpdate");
  }
  return newDom;
}
function getRenderer() {
  return this.constructor(this.props);
}
/**
 *
 * @param {import("../ui").vNode} vn
 * @param {import("../ui").vNode} oldVnode
 * @param {object} context
 * @param {Array<import("../ui").UiComponent>} mounts
 * @param {import("../ui").UiElement} parentDom
 * @param {import("../ui").lifeCycleMethod} lifeCycle
 * @returns {import("../ui").vNode}
 */
function instantiateComponent(
  vn,
  oldVnode,
  context,
  mounts,
  parentDom,
  lifeCycle
) {
  /**
   * @type {import("../ui").UiComponent}
   */
  let c,
    isClassComponent = false;
  if (oldVnode._component) {
    vn._component = c = oldVnode._component;
    vn._dom = oldVnode._dom;
    c.props = vn.props;
  } else {
    if (vn.type.prototype && vn.type.prototype.render) {
      vn._component = c = new vn.type(vn.props, context);
      isClassComponent = true;
      c.parent = parentDom;
    } else {
      c = new Component(vn.props, context);
      c.constructor = vn.type;
      c.render = getRenderer;
    }
  }
  if (c.state == null) {
    c.state = {};
  }
  if (c._nextState == null) {
    c._nextState = c.state;
  }
  if (isClassComponent) {
    if (lifeCycle == null || lifeCycle === "componentWillMount") {
      mounts.push(c);
      if (vn.type.getDerivedStateFromProps != null) {
        assign(
          c._nextState === c.state
            ? (c._nextState = assign({}, c._nextState))
            : c._nextState,
          vn.type.getDerivedStateFromProps(currentVnode.props, c._nextState)
        );
      } else {
        runLifeCycle(c, "componentWillMount");
      }
    } else {
      runLifeCycle(c, lifeCycle, true);
    }
  }
  const node = toVnode(c.render(c.props, c.state));
  node._component = c;
  c._vnode = node;
  node._prevVnode = c._prevVnode = vn;
  return node;
}

// /**
//  *
//  * @param {import("../ui").vNode} vn
//  */
// function recursivelySetFragmentDescriptor(vn) {
//   for (const child of vn._children) {
//     if (child.type !== Fragment) {
//       child._lastFragmentParent = vn;
//     } else {
//       recursivelySetFragmentDescriptor(child);
//     }
//   }
// }
