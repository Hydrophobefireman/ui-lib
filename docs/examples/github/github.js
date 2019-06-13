/**@see https://preactjs.com/repl */
import Component, {
  createElement as h,
  render,
  Fragment
} from "../../ui/index.js";
const SEARCH = "https://api.github.com/search/repositories";

class GithubResults extends Component {
  async componentDidMount() {
    let res = await fetch(`${SEARCH}?q=${this.props.q}`),
      json = await res.json(),
      results = (json && json.items) || [];
    this.setState({ results });
  }
  render({ q }, { results = [] }) {
    return h(
      "div",
      null,
      h(
        "h1",
        {
          style: "text-align:center;"
        },
        "Results For:",
        q
      ),
      h(
        "div",
        {
          class: "list"
        },
        results.map(result => {
          return h(Result, {
            result
          });
        })
      )
    );
  }
}

const Result = ({ result }) =>
  h(
    "div",
    { class: "res-box" },
    h(
      "div",
      null,
      h(
        "a",
        {
          href: result.html_url,
          target: "_blank"
        },
        result.full_name
      ),
      "🌟",
      h("strong", null, result.stargazers_count)
    ),
    h("p", null, result.description)
  );

class Form extends Component {
  constructor() {
    super();
    this.state = { i: "react", b: false };
    this.set = () => this.setState({ b: true });
  }
  render({}, { i, b }) {
    return h(
      Fragment,
      null,
      h(
        "form",
        { onSubmit: this.set, action: "javascript:" },
        h("input", {
          value: i,
          onInput: e => this.setState({ i: e.target.value, b: false })
        }),
        h("button", null, "Search")
      ),
      b && h(GithubResults, { q: i })
    );
  }
}
render(h(Form), document.body);
