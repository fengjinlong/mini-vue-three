import { ShapeFlags } from "../shared/ShapeFlags";
export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");
export { createVNode as createElementVNode };
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    key: props && props.key,
    props,

    /**
     * component
     * 1 组件实例 instance, 为了组件更新逻辑时候 虚拟节点 拿到instance, 从而调用 instance.update()
     * 2 在组件初始化时候赋值
     * 3 更新逻辑同时需要更新组件的 props，所以需要存一下 更新的虚拟节点 next
     * 4 next 是下次要更新的虚拟节点
     * 5 vnode 是上次的虚拟节点
     * 6 next vnode 是挂载在 instance上的
     */
    component: null,
    children,
    shapeFlag: getShapeFlag(type),
    el: null,
  };
  // children
  if (typeof children === "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }
  // slots children
  // 组件 + children object
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
    }
  }

  return vnode;
}
export function createTextVNode(text: string) {
  return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
