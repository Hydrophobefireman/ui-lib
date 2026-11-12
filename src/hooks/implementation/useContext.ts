import type {Context} from "../../types/index.js";
import {getCurrentHookValueOrSetDefault} from "./util.js";
import {getHookStateAtCurrentRender} from "./manage.js";

export function useContext<T = any>(ctx: Context<T>): T {
  const state = getHookStateAtCurrentRender();
  const component = state[0];

  const index = state[1];
  const provider =
    (component._sharedContext && component._sharedContext[ctx.$id]) || null;
  const hooksData = component._hooksData;
  const data = getCurrentHookValueOrSetDefault(hooksData, index, () => ({
    args: null,
    hookState: false,
  }));

  // Track the actual provider identity so moving between providers (or from a
  // provider back to the default value) does not leave a stale subscription.
  const previousProvider = data.args;
  if (previousProvider !== provider) {
    if (previousProvider) previousProvider.remove(component);
    data.args = provider;
    if (provider) provider.add(component);
  }
  return provider ? provider.props.value : (ctx.def as T);
}
