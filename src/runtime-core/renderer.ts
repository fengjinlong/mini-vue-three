import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./components";

export function render(vnode, container) {
  // patch
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
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
  const { children, props } = vnode;
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(children, el);
  }
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
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
