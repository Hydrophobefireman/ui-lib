import Component, { h } from "../../../ui/index.js";
class TableCell extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

//   shouldComponentUpdate(nextProps, nextState) {
//     return this.props.text !== nextProps.text;
//   }

  onClick(e) {
    console.log(`Clicked${this.props.text}`);
    e.stopPropagation();
  }

  render(props) {
    return h(
      "td",
      {
        class: "TableCell",
        onClick: this.onClick
      },
      props.text
    );
  }
}

class TableRow extends Component {
//   shouldComponentUpdate(nextProps, nextState) {
//     return this.props.data !== nextProps.data;
//   }

  render(props) {
    const data = props.data;
    let classes = "TableRow";

    if (data.active) {
      classes = "TableRow active";
    }

    const cells = data.props;
    const children = [
      h(TableCell, {
        key: "-1",
        text: `#${data.id}`
      })
    ];

    for (let i = 0; i < cells.length; i++) {
      children.push(
        h(TableCell, {
          key: i,
          text: cells[i]
        })
      );
    }

    return h(
      "tr",
      {
        class: classes,
        "data-id": data.id
      },
      children
    );
  }
}

export class Table extends Component {
//   shouldComponentUpdate(nextProps, nextState) {
//     return this.props.data !== nextProps.data;
//   }

  render(props) {
    const items = props.data.items;
    const children = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      children.push(
        h(TableRow, {
          key: item.id,
          data: item
        })
      );
    }

    return h(
      "table",
      {
        class: "Table"
      },
      h("tbody", null, children)
    );
  }
}
