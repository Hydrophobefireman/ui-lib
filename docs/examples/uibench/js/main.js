import Component, {h} from "../../../ui/index.js";
import {Table} from "./table.js";
import {Anim} from "./anim.js";
import {Tree} from "./tree.js";
export class Main extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data !== nextProps.data;
  }

  render() {
    const data = this.props.data;
    const location = data.location;
    let section;

    if (location === "table") {
      section = h(Table, {
        data: data.table,
      });
    } else if (location === "anim") {
      section = h(Anim, {
        data: data.anim,
      });
    } else if (location === "tree") {
      section = h(Tree, {
        data: data.tree,
      });
    }

    return h(
      "div",
      {
        class: "Main",
      },
      section
    );
  }
}
