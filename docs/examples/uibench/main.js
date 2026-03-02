import {
  config,
  createElement as h,
  render,
} from "https://esm.sh/@hydrophobefireman/ui-lib";

import {Main} from "./js/main.js";
uibench.init("ui-lib", "??");
document.addEventListener("DOMContentLoaded", (e) => {
  const container = document.querySelector("#App");
  uibench.run(
    (state) => render(h(Main, {data: state}), container),
    (samples) =>
      render(h("pre", null, JSON.stringify(samples, null, " ")), container),
  );
});
