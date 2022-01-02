import Component, {createElement as h} from "../../../ui/index.js";

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

export default class TodoItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleSubmit = () => {
      let {onSave, onDestroy, todo} = this.props,
        val = this.state.editText.trim();
      if (val) {
        onSave(todo, val);
        this.setState({editText: val});
      } else {
        onDestroy(todo);
      }
    };
    this.handleEdit = () => {
      let {onEdit, todo} = this.props;
      onEdit(todo);
      this.setState({editText: todo.title});
    };
    this.toggle = (e) => {
      let {onToggle, todo} = this.props;
      onToggle(todo);
      e.preventDefault();
    };
    this.handleTextInput = (e) => {
      this.setState({editText: e.target.value});
    };

    this.handleKeyDown = (e) => {
      if (e.which === ESCAPE_KEY) {
        let {todo} = this.props;
        this.setState({editText: todo.title});
        this.props.onCancel(todo);
      } else if (e.which === ENTER_KEY) {
        this.handleSubmit();
      }
    };

    this.handleDestroy = () => {
      this.props.onDestroy(this.props.todo);
    };
  }

  // shouldComponentUpdate({ todo, editing, editText }) {
  // 	return (
  // 		todo !== this.props.todo ||
  // 		editing !== this.props.editing ||
  // 		editText !== this.state.editText
  // 	);
  // }

  componentDidUpdate() {
    let node = this.base && this.base.querySelector(".edit");
    if (node) node.focus();
  }

  render({todo: {title, completed}, onToggle, onDestroy, editing}, {editText}) {
    return h(
      "li",
      {
        class: "" + (completed ? "completed" : "") + (editing ? "editing" : ""),
      },
      h(
        "div",
        {
          class: "view",
        },
        h("input", {
          class: "toggle",
          type: "checkbox",
          checked: completed,
          onChange: this.toggle,
        }),
        h(
          "label",
          {
            onDblClick: this.handleEdit,
          },
          title
        ),
        h("button", {
          class: "destroy",
          onClick: this.handleDestroy,
        })
      ),
      editing &&
        h("input", {
          class: "edit",
          value: editText,
          onBlur: this.handleSubmit,
          onInput: this.handleTextInput,
          onKeyDown: this.handleKeyDown,
        })
    );
  }
}
