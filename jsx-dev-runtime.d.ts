import "@hydrophobefireman/ui-lib";
import type {ComponentType, VNode} from "@hydrophobefireman/ui-lib";

export {Fragment} from "@hydrophobefireman/ui-lib";

type ElementType =
  | string
  | ComponentType<any>
  | ((...args: any[]) => any);

export function jsx(
  type: ElementType,
  props: any,
  key?: any
): VNode | null;
export function jsxs(
  type: ElementType,
  props: any,
  key?: any
): VNode | null;
export function jsxDEV(
  type: ElementType,
  props: any,
  key?: any,
  ...rest: any[]
): VNode | null;
