import { defer, assign, EMPTY_OBJ, appendChild } from "./util.js";
import { commitMounts } from "./lifeCycleRunner.js";
import { diff } from "./diff/index.js";
/**
 * @type {Array<import("./ui").UiComponent>}
 */
const RENDER_QUEUE = [];
class Component {
  constructor(props, context) {
    // /**
    //  * @type {import("./ui").vNode}
    //  */
    // this._vnode = null;
    // /**
    //  * @type {Component}
    //  */
    // this._previousComponent = null;
    // /**
    //  * @type {import("./ui").lifeCycleMethod}
    //  */
    // this.__currentLifeCycle = null;
    this.props = props;
    this.context = context;
    this.state = {};
  }
  /**
   * @param {import("./ui").UiComponent['props']} props
   * @param {this['state']} state
   * @returns {import("./ui").vNode}
   */
  render(props, state) {
    return;
  }
  setState(updater) {
    this._nextState = assign({}, this.state || EMPTY_OBJ);
    this._oldState = assign({}, this._nextState);
    const next =
      typeof updater === "function"
        ? (updater = updater(this._nextState, this.props))
        : updater;
    if (next == null) return;
    assign(this._nextState, next);
    assign(this.state, this._nextState);
    enqueueRender(this);
  }
  forceUpdate(callback) {
    const parentDom = this.parentDom;
    const mounts = [];
    if (parentDom) {
      const force = callback !== false;
      /**
       * @type {import("./ui").vNode}
       */
      const vn = this._vnode;
      const _sibDom = vn != null ? vn._nextDomNode : null;

      /**
       * @type {import("./ui").UiNode}
       */
      this.base = diff(parentDom, vn, vn, this.context, mounts, this, force);
      if (this.base instanceof Node && !this.base.parentNode) {
        appendChild(parentDom, this.base, _sibDom);
      }
    }
    if (callback) callback();
    commitMounts(mounts);
  }
}
export function enqueueRender(c) {
  c._dirty = true;
  if (RENDER_QUEUE.push(c) === 1) {
    window.requestAnimationFrame != null
      ? window.requestAnimationFrame(process)
      : defer(process);
  }
}

function process() {
  let p;
  RENDER_QUEUE.sort((x, y) => x._depth - y._depth);
  while ((p = RENDER_QUEUE.pop())) {
    if (p._dirty) {
      p._nextState = null;
      p._dirty = false;
      p.forceUpdate(false);
    }
  }
}
export default Component;
