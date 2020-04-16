import Component, { createElement as h } from "../../../ui/index.js";
import { pluralize } from "./util.js";

export default class TodoFooter extends Component {
  render({ nowShowing, count, completedCount, onClearCompleted }) {
    return h(
      "footer",
      {
        class: "footer"
      },
      h(
        "span",
        {
          class: "todo-count"
        },
        h("strong", null, count),
        " ",
        pluralize(count, "item"),
        " left"
      ),
      h(
        "ul",
        {
          class: "filters"
        },
        h(
          "li",
          null,
          h(
            "a",
            {
              href: "#/",
              class: nowShowing == "all" && "selected"
            },
            "All"
          )
        ),

        h(
          "li",
          null,
          h(
            "a",
            {
              href: "#/active",
              class: nowShowing == "active" && "selected"
            },
            "Active"
          )
        ),
        h(
          "li",
          null,
          h(
            "a",
            {
              href: "#/completed",
              class: nowShowing == "completed" && "selected"
            },
            "Completed"
          )
        )
      ),
      completedCount > 0 &&
        h(
          "button",
          {
            class: "clear-completed",
            onClick: onClearCompleted
          },
          "Clear completed"
        )
    );
  }
}
