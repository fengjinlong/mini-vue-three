import { createComponentInstance, setupComponent } from "./components";

export function render(vnode, container) {
  // patch
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  processComponent(vnode, container);
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
