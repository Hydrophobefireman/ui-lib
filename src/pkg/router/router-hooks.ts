import {useContext} from "../../hooks/index.js";
import {RouteParamContext} from "./router.js";

export function useRoute() {
  return useContext(RouteParamContext);
}
