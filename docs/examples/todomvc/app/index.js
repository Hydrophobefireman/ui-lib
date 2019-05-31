import Component, { createElement as h } from "../../../ui/index.js";
import TodoModel from "./model.js";
import TodoFooter from "./footer.js";
import TodoItem from "./item.js";

const ENTER_KEY = 13;

const FILTERS = {
  all: todo => true,
  active: todo => !todo.completed,
  completed: todo => todo.completed
};

export default class App extends Component {
  constructor() {
    super();
    this.state = {};
    this.model = new TodoModel("ui-todos", () => this.setState({}));
    addEventListener("hashchange", this.handleRoute.bind(this));
    this.handleRoute();
  }

  handleRoute() {
    let nowShowing = String(location.hash || "")
      .split("/")
      .pop();
    if (!FILTERS[nowShowing]) {
      nowShowing = "all";
    }
    this.setState({ nowShowing });
  }

  handleNewTodoKeyDown = e => {
    if (e.keyCode !== ENTER_KEY) return;
    e.preventDefault();

    let val = this.state.newTodo.trim();
    if (val) {
      this.model.addTodo(val);
      this.setState({ newTodo: "" });
    }
  };

  handleNewTodoInput = e => {
    this.setState({ newTodo: e.target.value });
  };

  toggleAll = event => {
    let checked = event.target.checked;
    this.model.toggleAll(checked);
  };

  toggle = todo => {
    this.model.toggle(todo);
  };

  destroy = todo => {
    this.model.destroy(todo);
  };

  edit = todo => {
    this.setState({ editing: todo.id });
  };

  save = (todoToSave, text) => {
    this.model.save(todoToSave, text);
    this.setState({ editing: null });
  };

  cancel = () => {
    this.setState({ editing: null });
  };

  clearCompleted = () => {
    this.model.clearCompleted();
  };

  render({}, { nowShowing = "all", newTodo, editing }) {
    let { todos } = this.model,
      shownTodos = todos.filter(FILTERS[nowShowing]),
      activeTodoCount = todos.reduce(
        (a, todo) => a + (todo.completed ? 0 : 1),
        0
      ),
      completedCount = todos.length - activeTodoCount;

    return h(
      "div",
      null,
      h(
        "header",
        {
          class: "header"
        },
        h("h1", null, "todos"),
        h("input", {
          class: "new-todo",
          placeholder: "What needs to be done?",
          value: newTodo || "",
          onKeyDown: this.handleNewTodoKeyDown,
          onInput: this.handleNewTodoInput,
          autoFocus: true
        })
      ),
      todos.length
        ? h(
            "section",
            {
              class: "main"
            },
            h("input", {
              id: "toggle-all",
              class: "toggle-all",
              type: "checkbox",
              onChange: this.toggleAll,
              checked: activeTodoCount === 0
            }),
            h(
              "label",
              {
                for: "toggle-all"
              },
              "Mark all as complete"
            ),
            h(
              "ul",
              {
                class: "todo-list"
              },
              shownTodos.map(todo =>
                h(TodoItem, {
                  todo: todo,
                  onToggle: this.toggle,
                  onDestroy: this.destroy,
                  onEdit: this.edit,
                  editing: editing === todo.id,
                  onSave: this.save,
                  onCancel: this.cancel
                })
              )
            )
          )
        : null,
      activeTodoCount || completedCount
        ? h(TodoFooter, {
            count: activeTodoCount,
            completedCount: completedCount,
            nowShowing: nowShowing,
            onClearCompleted: this.clearCompleted
          })
        : null
    );
  }
}
