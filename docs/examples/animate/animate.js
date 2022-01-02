// ported(?) with minimal changes from https://codepen.io/developit/pen/LpNOdm/
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
} /** @jsx h */
import Component, {
  render,
  createElement as h,
  createRef,
} from "../../ui/index.js";
const {memoize} = (globalThis || self).decko;
let {pow, sqrt, sin, cos, atan2} = Math;

class Main extends Component {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "state", {text: "", lines: []});
    this.ref = createRef();

    _defineProperty(
      this,
      "updatePosition",

      () => {
        this.position =
          this.ref.current &&
          this.ref.current.querySelector(".logo").getBoundingClientRect();
      }
    );
    _defineProperty(
      this,
      "handleMouseMove",

      (e) => {
        if (this.timer) clearTimeout(this.timer), (this.timer = null);
        let t = (e.touches && e.touches[0]) || e;
        this.setState({
          x: t.pageX - (this.position ? this.position.left : 0),
          y: t.pageY - (this.position ? this.position.top : 0),
        });

        return e.preventDefault(), false;
      }
    );
    _defineProperty(
      this,
      "color",

      memoize((index) => {
        let rnd = () => (Math.random() * 255) | 0;
        return `rgb(${rnd()},${rnd()},${rnd()})`;
      })
    );
    _defineProperty(
      this,
      "textToLines",

      memoize((text) => {
        text = (text || "").trim();
        return text.split("\n").map((text, i) => ({
          text,
          color: this.color(i),
        }));
      })
    );
  } // hook up touch/mouse follower and run the gross demo
  componentDidMount() {
    addEventListener("resize", this.updatePosition); // addEventListener(TOUCH?'touchmove':'mousemove', this.handleMouseMove);
    const evt = "onpointermove" in document.body ? "pointermove" : "mousemove"; // TOUCH?'touchmove':'mousemove'
    addEventListener(evt, this.handleMouseMove);
  }
  componentDidUpdate() {
    let {text} = this.state;
    if (text !== this.lastText) {
      this.lastText = text;
      this.updatePosition();
    }
  }
  render({}, {over, x, y, text, animated}) {
    let lines = this.textToLines(text);
    return h(
      "div",
      {class: animated ? "animated" : "", ref: this.ref},
      h(
        "div",
        {class: "input"},
        h(
          "p",
          null,
          h("strong", null, "Hint:"),
          " You can change the text while moving your mouse."
        ),
        h(
          "textarea",
          {onInput: (e) => this.setState({text: e.target.value})},
          text
        )
      ),

      h(
        "div",
        {class: "logo"},
        lines.map(({text, color}, index) => h(Line, {index, text, x, y, color}))
      )
    );
  }
}

/** Represents a line, which is a sequence of characters */
const Line = ({x = 0, y = 0, index, text, color: background}) => {
  let letters = text.split("").map((letter, i) => {
    let left = i * 40,
      top = index * 40,
      xc = left + 20,
      yc = top + 20;

    // calculate vector from mouse to centroid
    let mag = sqrt(pow(x - xc, 2) + pow(y - yc, 2)),
      dir = atan2(y - yc, x - xc),
      offset = mag < 200 ? mag / 10 - 20 : 0;

    let transform = `translate3d(${cos(dir) * offset}px, ${
      sin(dir) * offset
    }px, 0)`;
    return h(
      "span",
      {style: {background, transform, left: `${left}px`, top: `${top}px`}},
      letter
    );
  });
  return h(
    "div",
    {
      class: "line",
      style: {
        width: `${letters.length * 40}px`,
        height: "40px",
      },
    },
    letters
  );
};

setTimeout(() => {
  render(h(Main, null), document.body);
});

// https://git.io/praline
function sequence(funcs, callback) {
  let i = 0;
  let c = funcs.length;
  if (!c) return callback(null);
  let results = [];
  let next = () => {
    let func = funcs[i++];
    let args = [];
    if (Array.isArray(func)) {
      args = func.slice();
      func = args.shift();
    }
    args.push((err, data) => {
      if (err) return callback(err);
      results[i - 1] = data;
      if (i < c) next();
      else callback(null, ...results);
    });
    func(...args);
  };
  next();
}
