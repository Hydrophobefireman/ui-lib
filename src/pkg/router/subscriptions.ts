import { $push } from "../../util";
const _routerSubscriptions: Array<
  (e: PopStateEvent | null, options: {}) => any
> = [];

interface Subscription {
  (e: PopStateEvent | string): any;
}
export const RouterSubscription = {
  _routerSubscriptions,
  subscribe(fun: Subscription) {
    $push(_routerSubscriptions, fun);
  },
  unsubscribe(fun: Subscription) {
    _routerSubscriptions.splice(_routerSubscriptions.indexOf(fun), 1);
  },

  emit(e: PopStateEvent | string, options: {}) {
    _routerSubscriptions.forEach((subscription) =>
      subscription(e as PopStateEvent, options)
    );
  },
  unsubscribeAll() {
    _routerSubscriptions.length = 0;
  },
};
