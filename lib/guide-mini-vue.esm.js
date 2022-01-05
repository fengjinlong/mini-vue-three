const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // console.log(instance)
        const { setupState } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        // $el
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

// 创建组件实例
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
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
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    // 这里的虚拟节点是 patch element 的虚拟节点
    // 也就是subTree，这里的vnode就是subTree
    const el = (vnode.el = document.createElement(vnode.type));
    // children 有 string array
    const { children, props, shapeFlag } = vnode;
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(children, el);
    }
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(childrenVnode, container) {
    childrenVnode.forEach((v) => {
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
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    const subtree = instance.render.call(proxy);
    patch(subtree, container);
    // patch 结束后，所有组件渲染完毕，此时 subtree 是最终虚拟节点
    vnode.el = subtree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    // children
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
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
