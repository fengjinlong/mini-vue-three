const isObject = (val) => {
    return val !== null && typeof val === "object";
};

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
    patch(vnode, container);
}
function patch(vnode, container) {
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    // children 有 string array
    const { children, props } = vnode;
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(children, el);
    }
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.forEach((v) => {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    // 组件实例
    const instance = createComponentInstance(vnode);
    // 进一步处理组件实例,设置render
    setupComponent(instance);
    // 调用render，渲染dom
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const subtree = instance.render();
    patch(subtree, container);
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
            render(vnode, rootContain);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
