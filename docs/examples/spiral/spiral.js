import {Component, render, h, config} from "../../ui/index.js";
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

/** @jsx h */
const COUNT = 200;
const LOOPS = 6;

class Main extends Component {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "state", {x: 0, y: 0, big: false, counter: 0});
    this.increment = () => {
      this.state.counter++; // avoids an object allocation
      this.setState();
    };
  }

  componentDidMount() {
    let touch = navigator.maxTouchPoints > 1;

    // set mouse position state on move:
    addEventListener(touch ? "touchmove" : "mousemove", (e) => {
      this.setMouse(e.touches ? e.touches[0] : e);
    });

    // holding the mouse down enables big mode:
    addEventListener(touch ? "touchstart" : "mousedown", (e) => {
      this.setBig(true);
      e.preventDefault();
    });
    addEventListener(touch ? "touchend" : "mouseup", (e) => this.setBig(false));

    this.increment();
  }

  componentDidUpdate() {
    // invoking setState() in componentDidUpdate() creates an animation loop:
    this.increment();
  }

  setMouse({pageX: x, pageY: y}) {
    this.setState({x, y});
    return false;
  }

  setBig(big) {
    this.setState({big});
  }

  // builds and returns a brand new DOM (every time)
  render(props, {x, y, big, counter}) {
    let max =
        COUNT +
        Math.round(Math.sin((counter / 90) * 2 * Math.PI) * COUNT * 0.5),
      cursors = [];

    // the advantage of JSX is that you can use the entirety of JS to "template":
    for (let i = max; i--; ) {
      let f = (i / max) * LOOPS,
        θ = f * 2 * Math.PI,
        m = 20 + i * 2,
        hue = (f * 255 + counter * 10) % 255;
      cursors[i] = h(Cursor, {
        big: big,
        color: "hsl(" + hue + ",100%,50%)",
        x: (x + Math.sin(θ) * m) | 0,
        y: (y + Math.cos(θ) * m) | 0,
      });
    }

    return h(
      "div",
      {id: "main"},
      h(Cursor, {label: true, x: x, y: y, big: big}),
      cursors
    );
  }
}

class Cursor extends Component {
  getClass(big, label) {
    let cl = "cursor";
    if (big) cl += " big";
    if (label) cl += " label";
    return cl;
  }

  // first argument is "props", the attributes passed to <Cursor ...>
  render({x, y, label, color, big}) {
    let inner = null;
    if (label) inner = h("span", {class: "label"}, x, ",", y);
    return h(
      "div",
      {
        class: this.getClass(big, label),
        style: {
          left: (x || 100) + "px",
          top: (y || 100) + "px",
          borderColor: color,
        },
      },
      inner
    );
  }
}

// Mount the top-level component to the DOM:
render(h(Main, null), document.getElementById("app"));

// Addendum: disable dragging on mobile
addEventListener("touchstart", (e) => (e.preventDefault(), false));
