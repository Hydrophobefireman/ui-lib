import {$push} from "../../util.js";
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
    const index = _routerSubscriptions.indexOf(fun);
    if (index > -1) _routerSubscriptions.splice(index, 1);
  },

  emit(e: PopStateEvent | string, options: {}) {
    // Iterate a snapshot so unsubscribing during notification cannot skip a
    // neighbor; check membership so an unsubscribed callback is not invoked.
    const snapshot = _routerSubscriptions.slice();
    for (const subscription of snapshot) {
      if (_routerSubscriptions.indexOf(subscription) > -1) {
        subscription(e as PopStateEvent, options);
      }
    }
  },
  unsubscribeAll() {
    _routerSubscriptions.length = 0;
  },
};
