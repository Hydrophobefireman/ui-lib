import { defer, assign, EMPTY_OBJ, appendChild } from "./util.js";
import { commitMounts, runLifeCycle } from "./lifeCycleRunner.js";
import { diff } from "./diff/index.js";

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
  }
  /**
   * @param {import("./ui").UiComponent['props']} props
   * @param {import("./ui").UiComponent['state']} state
   * @returns {import("./ui").vNode}
   */
  render(props, state) {
    return;
  }
  setState(updater) {
    this._nextState = assign({}, this.state || {});
    assign(
      this._nextState,
      typeof updater === "function"
        ? (updater = updater(this._nextState, this.props))
        : updater
    );
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
      const _sibDom = vn._nextDomNode;
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
    defer(process);
  }
}

function process() {
  let p;
  while ((p = RENDER_QUEUE.pop())) {
    // forceUpdate's callback argument is reused here to indicate a non-forced update.
    assign(p.state, p._nextState || {});
    p._nextState = null;
    p._dirty = false;
    p.forceUpdate(false);
  }
}
export default Component;
