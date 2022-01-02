import {createElement as h, render} from "../../ui/index.js";
import App from "./app/index.js";

render(h(App), document.querySelector(".todoapp"));
