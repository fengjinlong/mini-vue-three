import { h } from "../../lib/guide-mini-vue.esm.js";
window.self = null;
export const App = {
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
      },

      "hi mini-vue" + this.msg
      // [h("p", {}, "p1"), h("p", {}, "p2")]
    );
  },
  setup() {
    const msg = 1;
    return {
      msg,
    };
  },
};
