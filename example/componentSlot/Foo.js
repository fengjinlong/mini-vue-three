import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";
export const Foo = {
  setup() {
    return {};
  },
  render() {
    const foo = h("p", {}, "foo");
    // console.log(this.$slots);
    // {
    //   children: "123"
    //   el: null
    //   props: {}
    //   shapeFlag: 5
    //   type: "p"
    // }

    // 4 return h("div", {}, [foo, this.$slots])  第一种情况 ok

    // 5 数组
    // children在这里应该是vnode，vnode只能是string或组件，如果是数组应该处理
    /**
     * children可以为string, array
     * string -> h("div", {}, "xxx")
     * array  -> h("div", {}, [h("div", {}, "xxx1"), h("div", {}, "xxx2")])
     */

    /**
     * vnode 可以为 string，组件
     * string -> typeof(type) 为 string
     * 组件    -> typeof(type) 为 object
     * 没有数组类型
     */

    // 所以这里要用一个vnode包裹一下
    // return h("div", {}, [foo, h("div", {}, this.$slots)]);
    // 优化一下
    // return h("div", {}, [foo, renderSlots(this.$slots)]);

    // 第三种情况
    // 对象,具名插槽
    // return h("div", {}, [
    //   renderSlots(this.$slots, "header"),
    //   foo,
    //   renderSlots(this.$slots, "footer"),
    // ]);

    // 带参数 作用域插槽
    // return h("div", {}, [
    //   renderSlots(this.$slots, "header", {age: 18}),
    //   foo,
    //   renderSlots(this.$slots, "footer"),
    // ]);

    // 第四种情况 Text

    return h("div", {}, [
      renderSlots(this.$slots, "header", {age: 18}),
      foo,
      renderSlots(this.$slots, "footer"),
    ]);
  },
};
