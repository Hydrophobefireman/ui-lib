import type {Renderable} from "../../types";
import type {RoutePath} from "./util";

/**
 * A simple router that does NOT listen to any events
 * it's basically a pure, stateless function component
 * also ideal for server rendering your code
 */
export function MatchRouter(props: {paths: Map<RoutePath, Renderable<any>>}) {
    // const 
}
