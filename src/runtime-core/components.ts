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
    /**
     * component
     * 1 组件实例 instance, 为了组件更新逻辑时候 虚拟节点 拿到instance, 从而调用 instance.update()
     * 2 在组件初始化时候赋值
     * 3 更新逻辑同时需要更新组件的 props，所以需要存一下 更新的虚拟节点 next
     * 4 next 是下次要更新的虚拟节点
     */
    next: null,
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

  if (compiler && !Component.render) {
    if (Component.template) {
      Component.render = compiler(Component.template);
      console.log(Component.render);
    }
  }

  // 1 用户写好的render
  // 2 用户没写 render，只写了template, 要把template 转成render函数
  instance.render = Component.render;
}

export function getCurrentInstance() {
  return currentInstance;
}
export function setCurrentInstance(instance: any) {
  currentInstance = instance;
}

let compiler;
export function registerRuntimeCompile(_compiler) {
  compiler = _compiler;
}
