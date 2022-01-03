import { createComponentInstance, setupComponent } from "./components"

export function render (vnode, container) {
  // patch
  patch(vnode, container)
}

function patch(vnode: any, container: any) {
  processComponent(vnode, container)
}
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(vnode: any, container: any) {
  // 组件实例
  const instance = createComponentInstance(vnode)
  // 进一步处理组件实例
  setupComponent(instance)
}

