import {
  Component,
  render,
  h,
  useState,
  useCallback,
  useEffect,
  config,
} from "https://esm.sh/@hydrophobefireman/ui-lib";
// the useEffect hook itself heavily relies on requestAnimationFrame
// thus we have to use setTimeout to preventthe animation from practically
// slowing down by 2x
config.scheduleRender = cb=>requestAnimationFrame(cb);
/** @jsx h */
const COUNT = 200;
const LOOPS = 6;

function Main() {
  const [coords, setCoords] = useState({x: 0, y: 0});
  const [big, setBig] = useState(false);
  const [counter, setCounter] = useState(0);

  const increment = useCallback(() => setCounter((counter) => counter + 1), []);

  useEffect(() => {
    const touch = navigator.maxTouchPoints > 1;
    addEventListener(
      touch ? "touchmove" : "mousemove",
      ({pageX: x, pageY: y}) => setCoords({x, y})
    );
    addEventListener(touch ? "touchstart" : "mousedown", (e) => {
      setBig(true);
      e.preventDefault();
    });
    addEventListener(touch ? "touchend" : "mouseup", () => setBig(false));
  }, []);

  useEffect(increment);

  let max =
      COUNT + Math.round(Math.sin((counter / 90) * 2 * Math.PI) * COUNT * 0.5),
    cursors = [];
  const x = coords.x;
  const y = coords.y;
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

function getClass(big, label) {
  let cl = "cursor";
  if (big) cl += " big";
  if (label) cl += " label";
  return cl;
}
function Cursor({x, y, label, color, big}) {
  let inner = null;
  if (label) inner = h("span", {class: "label"}, x, ",", y);
  return h(
    "div",
    {
      class: getClass(big, label),
      style: {
        left: (x || 100) + "px",
        top: (y || 100) + "px",
        borderColor: color,
      },
    },
    inner
  );
}

// Mount the top-level component to the DOM:
render(h(Main, null), document.getElementById("app"));

// Addendum: disable dragging on mobile
addEventListener("touchstart", (e) => (e.preventDefault(), false));
