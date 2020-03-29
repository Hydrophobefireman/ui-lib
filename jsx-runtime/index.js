/**
 * @see https://babeljs.io/blog/2020/03/16/7.9.0#a-new-jsx-transform-11154
 */

/**
 * We Do not really need multiple functions {jsx, jsxs} so we will just alias them to createElement
 */

export { createElement as jsx } from "../";
export { createElement as jsxs } from "../";
export { Fragment } from "../";
