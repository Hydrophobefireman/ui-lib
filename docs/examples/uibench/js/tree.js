import Component, {h} from "../../../ui/index.js";
class TreeLeaf extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data !== nextProps.data;
  }

  render(props) {
    return h(
      "li",
      {
        class: "TreeLeaf",
      },
      props.data.id
    );
  }
}

class TreeNode extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data !== nextProps.data;
  }

  render(props) {
    const data = props.data;
    const children = [];

    for (let i = 0; i < data.children.length; i++) {
      const n = data.children[i];

      if (n.container) {
        children.push(
          h(TreeNode, {
            key: n.id,
            data: n,
          })
        );
      } else {
        children.push(
          h(TreeLeaf, {
            key: n.id,
            data: n,
          })
        );
      }
    }

    return h(
      "ul",
      {
        class: "TreeNode",
      },
      children
    );
  }
}

export class Tree extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data !== nextProps.data;
  }

  render(props) {
    return h(
      "div",
      {
        class: "Tree",
      },
      h(TreeNode, {
        data: props.data.root,
      })
    );
  }
}
