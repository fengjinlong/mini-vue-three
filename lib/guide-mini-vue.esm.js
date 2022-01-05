const extend = Object.assign;
const isObject = (value) => {
    return value !== null && typeof value === "object";
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};
const isOn = (key) => /^on[A-Z]/.test(key);

/**
 * dep依赖 是唯一的，用 Set
 * target 对应 key, key 对应 dep
 * dep = targetMap.get(target).get(key)
 * dep -> {effect1, effect2, effect3, ...}
 * 执行的时候 effect.run()
 */
const targetMap = new Map();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadOnly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadOnly;
        }
        else if (key === "__v_isReadOnly" /* IS_READONLY */) {
            return isReadOnly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadOnly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter(isReadOnly = false) {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandler = {
    get,
    set,
};
const readonlyHandler = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`${key} 是 readonly`);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandler, {
    get: shallowReadonlyGet,
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandler);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandler);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} 必须是对象`);
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}

function emit(instance, event, ...arg) {
    const { props } = instance;
    // add -> Add
    // add-add -> addAdd
    const handlerName = toHandlerKey(camelize(event));
    // console.log(handlerName)
    const handler = props[handlerName];
    handler && handler(...arg);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // console.log(instance)
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
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
        props: {},
        emit: () => { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
// 处理组件实例
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
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
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
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
        // 处理事件
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
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
