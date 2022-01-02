import {useState, useEffect, h, render} from "../../ui/index.js";

function List(props) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    setItems([...items, props.num]);
  }, [props.num]);
  return h(
    "ul",
    null,
    items.map((item, index) =>
      h(
        "li",
        {key: item},
        h("span", {class: "item"}, item),
        h(
          "button",
          {
            onClick: () => {
              setItems((items) => {
                const updatedItems = [...items];
                updatedItems.splice(index, 1);
                return updatedItems;
              });
            },
          },

          h("span", {role: "img", "aria-label": "punch"}, "\uD83E\uDD4A")
        )
      )
    )
  );
}

function App() {
  const [num, setNum] = useState(1);
  const list = h(List, {num: num});
  return h(
    "div",
    null,
    h("h1", null, "React State"),
    h("button", {onClick: () => setNum(num + 1)}, "Add item"),
    list,
    list
  );
}

const rootElement = document.getElementById("app");
render(h(App, null), rootElement);
