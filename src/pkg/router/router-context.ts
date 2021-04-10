import { createContext } from "../../context";

export const RouteContext = createContext(
  null as {
    path: string;
    query: URLSearchParams;
    params: { [k: string]: string };
  }
);
