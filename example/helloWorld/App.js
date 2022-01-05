import { h } from "../../lib/guide-mini-vue.esm.js";
import {Foo} from "./Foo.js"
window.self = null;
export const App = {
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        onClick() {
          console.log("click");
        },
        onMouseDown() {
          console.log("mousedown");
        },
      },

      // "hi mini-vue" + this.msg
      [h("p", {}, "p1"), h(Foo, {count: "foo-props"})]
    );
  },
  setup() {
    const msg = 1;
    return {
      msg,
    };
  },
};
