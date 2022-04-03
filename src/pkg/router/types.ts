import {Renderable} from "../../types";

export interface RouterProps {
  fallbackComponent?: any;
  inMemoryRouter?: boolean;
  children?: any[];
}

export interface RoutePath {
  regex: RegExp;
  params: {[index: number]: string};
}

export interface UILibRouter {
  (props: RouterProps): Renderable<any>;
  path: string;
  qs: string;
  searchParams: URLSearchParams;
}
