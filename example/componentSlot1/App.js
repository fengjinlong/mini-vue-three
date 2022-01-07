// import { h,createTextVNode } from "../../lib/guide-mini-vue.esm.js";
import { h,createTextVNode } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const APP = {
  render() {
    const app = h("div", {}, "App");
    // 2 虚拟节点的children 赋值给slots
    // 1 p标签
    /**
     * 第一种情况实际使用
     * <Foo><p>123</p></Foo>
     *
     */
    // const foo = h(Foo,{},h("p", {}, "123"))Î

    /**
     * 第二种情况 数组
     * <Foo><p>123</p><p>456</p></Foo>
     *
     */
    // 数组
    // const foo = h(Foo, {}, [h("p", {}, '123'), h("p", {}, '456')]);

    // 第三种情况
    // 对象,具名插槽
    // const foo = h(
    //   Foo,
    //   {},
    //   {
    //     header: h("p", {}, "header"),
    //     footer: h("p", {}, "footer"),
    //   }
    // );

    // 第四种情况 作用域插槽
    // const foo = h(
    //   Foo,
    //   {},
    //   {
    //     header: ({ age }) => [
    //       h("p", {}, "header" + age),
    //     ],
    //     footer: () => h("p", {}, "footer"),
    //   }
    // );

    //  第五种情况
    const foo = h(
      Foo,
      {},
      {
        header: ({ age }) => [
          h("p", {}, "header" + age),
          createTextVNode("你好呀"),
        ],
        footer: () => h("p", {}, "footer"),
      }
    );
    return h("div", {}, [app, foo]);
  },
  setup() {
    return {};
  },
};
