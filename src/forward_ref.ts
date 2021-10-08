import { addPluginCallback } from "./config";
import { ComponentChild, Props, RefType } from "./types";
import { objectWithoutKeys } from "./util";

type RefObj<R> = ((val: R) => void) | RefType<R>;
export interface ForwardFn<P = {}, T = any> {
  (props: P, ref: RefObj<T>): JSX.Element;
}
export function forwardRef<P = Props<{ ref?: any }>, R = any>(C: ForwardFn) {
  function ForwardRef(props: P) {
    const cloned = objectWithoutKeys(props, ["ref"] as any);
    // check if this can cause problems with hooks or not
    // TODO: maybe have a version that does it implicitly too?
    return C(cloned, (props as any).ref);
  }
  ForwardRef.__REF_FORWARDED = true;
  return ForwardRef;
}

addPluginCallback({
  createElement(VNode, ref) {
    if (VNode && VNode.type && (VNode.type as any).__REF_FORWARDEDeeloca) {
      (VNode.props as any).ref = ref;
      VNode.ref = null;
    }
  },
});
