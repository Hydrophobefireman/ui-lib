import { Props, VNode } from "../../index";

import { Component } from "../../component";
import { assign } from "../../util";
import { createElement } from "../../create_element";
import { loadURL } from "./util";

function onLinkClick(e: MouseEvent) {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
    return;
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

function _call(func: EventListener, arg: MouseEvent, ref: HTMLAnchorElement) {
  return func.call(ref, arg);
}
type AnchorProps = Props<{
  preserveScroll?: boolean;
}>;
export class A extends Component {
  props: AnchorProps;
  _onClick: (e: MouseEvent) => void;
  constructor(props: AnchorProps) {
    super(props);
    this._onClick = (e: MouseEvent): void => {
      if (!this.props.preserveScroll) {
        window.scroll(0, 0);
      }
      const current = e.currentTarget as HTMLAnchorElement;
      _call(onLinkClick, e, current);
      const userOnClick = this.props.onClick;
      userOnClick && _call(userOnClick, e, current);
    };
  }

  render(props: Props<{}>): VNode {
    return createElement("a", assign({}, props, { onClick: this._onClick }));
  }
}
