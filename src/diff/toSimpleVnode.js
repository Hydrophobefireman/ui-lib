import { runLifeCycle } from "../lifeCycleRunner.js";
import Component from "../component.js";
import { assign, EMPTY_OBJ, EMPTY_ARR } from "../util.js";
import { toVnode } from "../create-element.js";

/**
 *
 * @param {import("../ui").vNode} newVnode
 * @param {import("../ui").vNode} oldVnode
 * @param {import("../ui").UiElement} parentDom
 * @param {Array<import("../ui").UiComponent>} mounts
 * @param {object} context
 * @param {boolean} force
 */
export function toSimpleVnode(
  newVnode,
  oldVnode,
  parentDom,
  mounts,
  context,
  force,
  previousComponent
) {
  /**
   * @type {import("../ui").UiComponent}
   */
  let c;
  /**
   * @type {import("../ui").vNode}
   */
  let vnode;
  let isNew;
  const newType = newVnode.type;
  if (oldVnode._component) {
    c = newVnode._component = oldVnode._component;
    c.base = newVnode._dom = oldVnode._dom;
    c.props = newVnode.props;
    c.context = context;
    isNew = false;
    if (!force) {
      if (
        c.shouldComponentUpdate != null &&
        c.shouldComponentUpdate(newVnode.props, c.state) !== false
      ) {
      } else if (c.shouldComponentUpdate != null) {
        return EMPTY_OBJ;
      }
    }
  } else {
    isNew = true;
    if (newType.prototype && newType.prototype.render) {
      c = newVnode._component = new newType(newVnode.props, context);
      mounts.push(c);
    } else {
      c = new Component(newVnode.props, context);
      newVnode._component = null;
      c.constructor = newType;
      c.render = getRenderer;
    }
  }
  c.parentDom = parentDom;
  if (c.state == null) c.state = {};
  c._nextState = assign({}, c.state);
  if (newType.getDerivedStateFromProps != null) {
    assign(
      c._nextState,
      newType.getDerivedStateFromProps(newVnode.props, c._nextState) ||
        EMPTY_OBJ
    );
    assign(c._oldState || (c._oldState = {}), c._nextState);
  }

  if (isNew) {
    runLifeCycle(c, "componentWillMount");
  } else {
    runLifeCycle(
      c,
      "componentWillUpdate",
      newVnode.props,
      c._nextState,
      context
    );
  }
  c.state = c._nextState;
  vnode = c._prevVnode = toVnode(c.render(newVnode.props, c.state));
  if (vnode) {
    vnode._dom = newVnode._dom;
    vnode._reorder = newVnode._reorder;
  } //we maybe rendering null
  c._depth = previousComponent ? ~~previousComponent._depth + 1 : 0;
  return vnode;
}

function getRenderer(props, _, context) {
  return this.constructor(props, context);
}
