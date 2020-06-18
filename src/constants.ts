export const EMPTY_OBJ: any = {};
export const EMPTY_ARRAY: any[] = [];

export const IS_ARIA_PROP = /^aria[\-A-Z]/;

export const BATCH_MODE_SET_ATTRIBUTE = 1;
export const BATCH_MODE_REMOVE_ATTRIBUTE = BATCH_MODE_SET_ATTRIBUTE;
export const BATCH_MODE_REMOVE_ELEMENT = 2;
export const BATCH_MODE_SET_STYLE = 3;
export const BATCH_MODE_APPEND_CHILD = 4;
export const BATCH_MODE_INSERT_BEFORE = 5;

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
