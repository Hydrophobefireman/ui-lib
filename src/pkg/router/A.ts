import {Component} from "../../component.js";
import {createElement} from "../../create_element.js";
import type {Props, VNode} from "../../types/index.js";
import {loadURL} from "./util.js";

function isHashOnlyNavigation(url: URL) {
  return (
    !!url.hash &&
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  );
}

function canIntercept(e: MouseEvent, anchor: HTMLAnchorElement): URL {
  if (e.defaultPrevented) return null;
  if (e.button !== 0) return null;
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  if (anchor.getAttribute("href") == null) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.origin !== window.location.origin) return null;
  // Fragment-only links keep native scrolling/history behavior.
  if (isHashOnlyNavigation(url)) return null;
  return url;
}

function onLinkClick(e: MouseEvent, preserveScroll: boolean) {
  const anchor = e.currentTarget as HTMLAnchorElement;
  const url = canIntercept(e, anchor);
  if (!url) return;
  e.preventDefault();
  if (!preserveScroll) window.scroll(0, 0);
  loadURL(url.pathname + url.search + url.hash);
}

type AnchorProps = Props<{
  preserveScroll?: boolean;
  native?: boolean;
}>;
export class A extends Component {
  declare props: AnchorProps;
  _onClick: (e: MouseEvent) => void;
  constructor(props: AnchorProps) {
    super(props);
    this._onClick = (e: MouseEvent): void => {
      const ps = this.props.preserveScroll;
      const current = e.currentTarget as HTMLAnchorElement;
      const userOnClick = this.props.onClick;
      // User first: they can cancel navigation via preventDefault.
      userOnClick && (userOnClick as Function).call(current, e, ps);
      onLinkClick(e, ps);
    };
  }

  render(props: Props<{}>): VNode {
    const {preserveScroll, native, onClick, ...rest} = props as any;
    if (native) {
      if (onClick) (rest as any).onClick = onClick;
    } else {
      (rest as any).onClick = this._onClick;
    }
    return createElement("a", rest);
  }
}
