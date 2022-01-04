import { h } from "../../lib/guide-mini-vue.esm.js";
window.self = null;
export const App = {
  render() {
    window.self = this;
    return h(
      "div",
      {
      },
      "hi mini-vue" + this.msg
    );
  },
  setup() {
    const msg = 1

    return {
      msg,
    };
  },
};
