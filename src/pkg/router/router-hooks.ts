import {useContext} from "../../hooks/index";
import {RouteParamContext} from "./router";

export function useRoute() {
  return useContext(RouteParamContext);
}
