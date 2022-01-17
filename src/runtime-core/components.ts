import { proxyRef } from "..";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

// 创建组件实例
export function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    parent, // provide inject
    provides: parent ? parent.provides : {},
    props: {},
    subTree: {},
    isMounted: false,
    slots: {},
    emit: () => {},
  };
  component.emit = emit.bind(null, component) as any;
  return component;
}
// 处理组件实例
export function setupComponent(instance) {
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);

  // 处理组件返回的状态
  setupStatefulComponent(instance);
}
// 只能在 setup 里面获取，所以只能在setup 里面赋值
let currentInstance = null;
function setupStatefulComponent(instance: any) {
  // 调用组件的 setup 函数
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
  // instance.proxy = new Proxy({}, {
  //   get(target,key){
  //     const {setupState} = instance;
  //     if(key in setupState) {
  //       return setupState[key];
  //     }
  //     if (key === "$el") {
  //       console.log(instance.vnode.el)
  //       // 这是组件实例的虚拟节点
  //       return instance.vnode.el;
  //     }
  //   }
  // });

  const { setup } = instance.type;
  if (setup) {
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    setCurrentInstance(null);
    handleStateupResult(instance, setupResult);
  }
}
function handleStateupResult(instance, setupResult: any) {
  // setup 结果可能是 obj 或 function
  if (typeof setupResult === "object") {
    instance.setupState = proxyRef(setupResult);
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;
  instance.render = Component.render;
}

export function getCurrentInstance() {
  return currentInstance;
}
export function setCurrentInstance(instance: any) {
  currentInstance = instance;
}
