import Component, {h} from "../../../ui/index.js";

class AnimBox extends Component {
  //   shouldComponentUpdate(nextProps, nextState) {
  //     return this.props.data !== nextProps.data;
  //   }
  render() {
    const data = this.props.data;
    const time = data.time;
    const style = {
      borderRadius: `${(time % 10).toString()}px`,
      background: `rgba(0,0,0,${(0.5 + (time % 10) / 10).toString()})`,
    };

    return h("div", {
      class: "AnimBox",
      "data-id": data.id,
      style: style,
    });
  }
}

export class Anim extends Component {
  //   shouldComponentUpdate(nextProps, nextState) {
  //     return this.props.data !== nextProps.data;
  //   }
  render(props) {
    const data = props.data;
    const items = data.items;
    const children = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      children.push(
        h(AnimBox, {
          key: item.id,
          data: item,
        })
      );
    }

    return h(
      "div",
      {
        class: "Anim",
      },
      children
    );
  }
}
