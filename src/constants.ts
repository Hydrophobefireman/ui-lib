export const EMPTY_OBJ: any = {};
export const EMPTY_ARRAY: any[] = [];

export const IS_ARIA_PROP = /^aria[\-A-Z]/;
export const IS_SVG_ATTR = /^xlink:?/;

export const BATCH_MODE_SET_ATTRIBUTE = 1;
export const BATCH_MODE_REMOVE_ATTRIBUTE = BATCH_MODE_SET_ATTRIBUTE;
export const BATCH_MODE_REMOVE_ELEMENT = 2;
export const BATCH_MODE_SET_STYLE = 3;
export const BATCH_MODE_PLACE_NODE = 4;
export const BATCH_MODE_SET_SVG_ATTRIBUTE = 5;
export const BATCH_MODE_REMOVE_ATTRIBUTE_NS = 6;
export const BATCH_MODE_CLEAR_POINTERS = 7;

/**
 * Special constant to mark `null` elements
 * @example
 * function App() {
 *  return <div>{someCondition && <div>It is True!</div> }</div>
 * }
 * @description
 * in case `someCondition` is falsey, we will render a comment (`<!--$-->`) in the dom instead
 * this makes it easier for us to detect changes and additions/removals in case of <Fragment>
 * supporting which is the reason this "workaround" exists
 */
export const NULL_TYPE: any = {};

export const LIFECYCLE_WILL_MOUNT = "componentWillMount";
export const LIFECYCLE_DID_MOUNT = "componentDidMount";
export const LIFECYCLE_WILL_UPDATE = "componentWillUpdate";
export const LIFECYCLE_DID_UPDATE = "componentDidUpdate";
export const LIFECYCLE_WILL_UNMOUNT = "componentWillUnmount";

export type LifeCycleCallbacks =
  | "componentWillMount"
  | "componentDidMount"
  | "componentWillUnmount"
  | "shouldComponentUpdate"
  | "componentWillUpdate"
  | "componentDidUpdate";

export const Fragment: any = function Fragment() {};

export const RENDER_MODE_CLIENT = 0;
export const RENDER_MODE_SERVER = 1;
export const RENDER_MODE_HYDRATE = 2;
