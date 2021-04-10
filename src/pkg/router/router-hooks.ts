import { useContext } from "../../hooks/index";
import { RouteContext } from "./router-context";
export function useRoute() {
  return useContext(RouteContext);
}
