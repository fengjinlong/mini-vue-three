import { h, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props) {
    console.log(props);
    console.log(this);

    console.log(getCurrentInstance());
    // this.props.count = 1
  },
  render() {
    return h("div", {}, "foo-props: " + this.count);
  },
};
