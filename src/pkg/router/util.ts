import config from "../../config";
import { RouterSubscription } from "./subscriptions";

export interface RoutePath {
  regex: RegExp;
  params: { [index: number]: string };
}

export const sessKey = "UI--ROUTE";
function routeAction(url: string, action?: "pushState" | "replaceState") {
  if (!config.inMemoryRouter) {
    return window.history[action](null, "", url);
  } else {
    const u = new URL(url, window.location.href);
    config.memoryRouteStore.setItem(
      sessKey,
      JSON.stringify({ path: u.pathname, qs: u.search })
    );
  }
}

export function loadURL(url: string) {
  routeAction(url, "pushState");
  RouterSubscription.emit(url, { type: "load", native: false });
}
export function redirect(url: string) {
  routeAction(url, "replaceState");
  RouterSubscription.emit(url, { type: "redirect", native: false });
}

function _absolutePath(route: string) {
  return RegExp(`^${route}(/?)$`);
}

const pathFixRegex = /\/+$/;
export function fixPath(path: string): string {
  if (path.length === 1) return path;
  return path.replace(pathFixRegex, "");
}

export function createRoutePath(pathString: string | RoutePath): RoutePath {
  if (!pathString) throw Error("Invalid value for match: " + pathString);
  if ((pathString as RoutePath).regex != null) return pathString as RoutePath;
  pathString = fixPath(pathString as string);
  const params: { [index: number]: string } = {};
  let i = 0;
  const pathRegex = pathString
    .split("/")
    .map((partialPath) => {
      if (partialPath[0] === ":") {
        // param matcher
        params[++i] = partialPath.substr(1); // matches will start at 1
        return "([^?\\/]+)"; //match all non whitespace lazily
      }
      return partialPath;
    })
    .join("/");

  return { regex: _absolutePath(pathRegex), params };
}
