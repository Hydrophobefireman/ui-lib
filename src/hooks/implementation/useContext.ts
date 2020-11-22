import { Context } from "../../index";
import { getCurrentHookValueOrSetDefault } from "./util";
import { getHookStateAtCurrentRender } from "./manage";

export function useContext<T = any>(ctx: Context): T {
  const state = getHookStateAtCurrentRender();
  const component = state[0];

  const index = state[1];
  const provider =
    component._sharedContext && component._sharedContext[ctx.$id];
  //   if(!getCurrentHookValueOrSetDefault())
  if (!provider) return ctx.def as T;
  const hooksData = component._hooksData;
  getCurrentHookValueOrSetDefault(hooksData, index, {
    args: null,
    hookState: false,
  });
  const data = hooksData[index];
  if (!data.hookState) {
    data.hookState = true;
    provider.add(component);
  }
  return provider.props.value;
}
