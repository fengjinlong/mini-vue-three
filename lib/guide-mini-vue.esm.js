// 创建组件实例
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
    };
    return component;
}
// 处理组件实例
function setupComponent(instance) {
    // initprops
    // initslots
    // 处理组件返回的状态
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 调用组件的 setup 函数
    const { setup } = instance.type;
    if (setup) {
        const setupResult = setup();
        handleStateupResult(instance, setupResult);
    }
}
function handleStateupResult(instance, setupResult) {
    // setup 结果可能是 obj 或 function
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}

function render(vnode, container) {
    // patch
    patch(vnode);
}
function patch(vnode, container) {
    processComponent(vnode);
}
function processComponent(vnode, container) {
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    // 组件实例
    const instance = createComponentInstance(vnode);
    // 进一步处理组件实例,设置render
    setupComponent(instance);
    // 调用render，渲染dom
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    const subtree = instance.render();
    patch(subtree);
}

function createVNode(type, props, children) {
    const vndoe = {
        type,
        props,
        children,
    };
    return vndoe;
}

function createApp(rootComponent) {
    return {
        mount(rootContain) {
            const vnode = createVNode(rootComponent);
            render(vnode);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
