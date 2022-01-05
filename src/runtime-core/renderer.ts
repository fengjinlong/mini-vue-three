import { isObject, isOn } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./components";

export function render(vnode, container) {
  // patch
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  const { shapeFlag } = vnode;

  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container);
  }
}
function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}
function mountElement(vnode: any, container: any) {
  // 这里的虚拟节点是 patch element 的虚拟节点
  // 也就是subTree，这里的vnode就是subTree
  const el = (vnode.el = document.createElement(vnode.type));

  // children 有 string array
  const { children, props, shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el);
  }
  for (const key in props) {
    const val = props[key];

    // 处理事件
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, val);
    } else {
      el.setAttribute(key, val);
    }
  }
  container.append(el);
}
function mountChildren(childrenVnode: any, container: any) {
  childrenVnode.forEach((v) => {
    patch(v, container);
  });
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(vnode: any, container: any) {
  // 组件实例
  const instance = createComponentInstance(vnode);

  // 进一步处理组件实例,设置render
  setupComponent(instance);

  // 调用render，渲染dom
  setupRenderEffect(instance, vnode, container);
}

function setupRenderEffect(instance: any, vnode, container) {
  const { proxy } = instance;

  const subtree = instance.render.call(proxy);

  patch(subtree, container);
  // patch 结束后，所有组件渲染完毕，此时 subtree 是最终虚拟节点
  vnode.el = subtree.el;
}
