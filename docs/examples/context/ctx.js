import Component, {
  Fragment,
  createContext,
  createElement as h,
  render,
  useContext,
  useState,
} from "../../ui/index.js";

const ctx = createContext("bruh");

function App() {
  const [v, setV] = useState("");
  return h(
    Fragment,
    null,
    h(
      "div",
      null,
      h(
        ctx.Provider,
        { value: v },
        h("input", { value: v, onInput: (e) => setV(e.target.value) }),
        h(FValue),
        h(CValue),
        h(ctx.Consumer, null, (val) => {
          return h("div", null, "Consumer (value: ", val, " )");
        })
      )
    )
  );
}
class CValue extends Component {
  render(__, _, c) {
    // console.log(c || this.context);
    return h("div", null, "Context value is ", c);
  }
}
CValue.contextType = ctx;
function FValue() {
  const val = useContext(ctx);

  return h("div", null, "hooks (value: ", val, " )");
}
render(h(App), document.getElementById("app"));
