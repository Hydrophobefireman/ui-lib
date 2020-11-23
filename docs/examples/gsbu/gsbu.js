import Component, {
  createRef,
  createElement as h,
  render,
} from "../../ui/index.js";

class App extends Component {
  constructor() {
    super();
    this.ref = createRef();
    this.state = { count: 0 };
  }
  getSnapshotBeforeUpdate() {
    console.log("ok");

    return this.ref.current.getBoundingClientRect();
  }
  componentDidUpdate(_, __, s) {
    console.log(s);
  }
  render() {
    return h(
      "button",
      {
        onClick: () => this.setState((x) => ({ count: x.count + 1 })),
        ref: this.ref,
      },
      "count ",
      this.state.count
    );
  }
}

render(h(App), document.getElementById("app"));
