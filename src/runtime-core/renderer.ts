import { isObject } from "../reactivity/shared/index";
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
  const el = document.createElement(vnode.type);
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
function mountChildren(vnode: any, container: any) {
  vnode.forEach((v) => {
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
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance: any, container) {
  const subtree = instance.render();

  patch(subtree, container);
}
