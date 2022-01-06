import { createVNode } from "../vnode";

/**
 * @description
 * @author Werewolf
 * @date 2022-01-06
 * @export
 * @param {*} slots
 * @param {*} name 具名插槽
 * @param {*} props 作用域插槽  子传父 的参数
 * @return {*}
 */
export function renderSlots(slots, name, props) {
  const slot = slots[name];
  if (slot) {
    if (typeof slot === "function") {
      return createVNode("div", {}, slot(props));
    }
  }
}
