import { Props, VNode } from "./types/index";
import { assign, objectWithoutKeys } from "./util";
import { createElementChildren, getVNode, skipProps } from "./create_element";

export function cloneElement<P = {}>(
  VNode: VNode<P>,
  props?: Props<P>
): VNode<P> {
  if (!VNode) return null;
  props = assign({}, VNode.props, props);
  if (arguments.length > 2)
    (props as any).children = createElementChildren(arguments);
  let normalizedProps: Props<P> = objectWithoutKeys(
    props,
    skipProps
  ) as Props<P>;
  return getVNode<P, unknown>(
    VNode.type,
    normalizedProps,
    props.key || VNode.key,
    props.ref || VNode.ref
  );
}
