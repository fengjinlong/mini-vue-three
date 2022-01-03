// 创建组件实例
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
  };
  return component;
}
// 处理组件实例
export function setupComponent(instance) {
  // initprops
  // initslots

  // 处理组件返回的状态
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  // 调用组件的 setup 函数

  const { setup } = instance.type;
  if (setup) {
    const setupResult = setup();
    handleStateupResult(instance, setupResult);
  }
}
function handleStateupResult(instance, setupResult: any) {
  // setup 结果可能是 obj 或 function
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;
  instance.render = Component.render;
}
