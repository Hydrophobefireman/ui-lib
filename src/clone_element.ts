import { assign, objectWithoutKeys } from "./util";
import { getVNode, skipProps } from "./create_element";
import { EMPTY_ARRAY } from "./constants";
import { VNode, Props } from "./types/index";

export function cloneElement<P = {}>(
  VNode: VNode<P>,
  props?: Props<P>
): VNode<P> {
  if (!VNode) return null;
  props = assign({}, VNode.props, props);
  if (arguments.length > 2)
    (props as any).children = EMPTY_ARRAY.slice.call(arguments, 2);
  let normalizedProps: Props<P> = objectWithoutKeys(props, skipProps) as Props<
    P
  >;
  return getVNode<P, unknown>(
    VNode.type,
    normalizedProps,
    props.key || VNode.key,
    props.ref || VNode.ref
  );
}
