import { Props, VNode } from "../../index";

import { Component } from "../../component";
import { assign } from "../../util";
import { createElement } from "../../create_element";
import { loadURL } from "./util";

function onLinkClick(e: MouseEvent, preserveScroll: boolean) {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
    return;
  }
  if (!preserveScroll) {
    window.scroll(0, 0);
  }
  if (e.stopImmediatePropagation) {
    e.stopImmediatePropagation();
  }
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  e.preventDefault();
  const el = new URL((this as HTMLAnchorElement).href, location.href);
  const href = el.pathname + el.search + el.hash;
  loadURL(href);
}

function _call(
  func: Function,
  arg: MouseEvent,
  preserveScroll: boolean,
  ref: HTMLAnchorElement
) {
  return func.call(ref, arg, preserveScroll);
}
type AnchorProps = Props<{
  preserveScroll?: boolean;
}>;
export class A extends Component {
  declare props: AnchorProps;
  _onClick: (e: MouseEvent) => void;
  constructor(props: AnchorProps) {
    super(props);
    this._onClick = (e: MouseEvent): void => {
      const ps = this.props.preserveScroll;
      const current = e.currentTarget as HTMLAnchorElement;
      _call(onLinkClick, e, ps, current);
      const userOnClick = this.props.onClick;
      userOnClick && _call(userOnClick, e, ps, current);
    };
  }

  render(props: Props<{}>): VNode {
    return createElement("a", assign({}, props, { onClick: this._onClick }));
  }
}
