import {
  createElement as h,
  render,
} from "https://esm.sh/@hydrophobefireman/ui-lib";

import App from "./app/index.js";

render(h(App), document.querySelector(".todoapp"));
