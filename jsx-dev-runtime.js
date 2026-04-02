import {Fragment, createElement} from "@hydrophobefireman/ui-lib";

function jsxDEV(el, props, ...rest) {
  return createElement(el, props);
}
let jsx = jsxDEV;
let jsxs = jsxDEV;
export {Fragment, jsx, jsxs, jsxDEV};
