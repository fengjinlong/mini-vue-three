'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        key: props && props.key,
        props,
        /**
         * component
         * 1 组件实例 instance, 为了组件更新逻辑时候 虚拟节点 拿到instance, 从而调用 instance.update()
         * 2 在组件初始化时候赋值
         * 3 更新逻辑同时需要更新组件的 props，所以需要存一下 更新的虚拟节点 next
         * 4 next 是下次要更新的虚拟节点
         * 5 vnode 是上次的虚拟节点
         * 6 next vnode 是挂载在 instance上的
         */
        component: null,
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
    // slots children
    // 组件 + children object
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* SLOTS_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

/**
 * @description
 * @author Werewolf
 * @date 2022-01-06
 * @export
 * @param {*} slots
 * @param {*} name 具名插槽
 * @param {*} props 作用域插槽  子传父 的参数
 * @return {*}
 */
function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

const extend = Object.assign;
const isObject = (value) => {
    return value !== null && typeof value === "object";
};
const hasChanged = (v1, v2) => {
    return !Object.is(v1, v2);
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

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        // active 避免重复清空
        this.active = true;
        this._fn = fn;
        // this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            // stop 状态
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const res = this._fn();
        shouldTrack = false;
        // return 是为了拿到 runner() 的返回结果
        return res;
    }
    stop() {
        if (this.active) {
            if (this.onStop) {
                this.onStop();
            }
            cleanupEffect(this);
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
/**
 * dep依赖 是唯一的，用 Set
 * target 对应 key, key 对应 dep
 * dep = targetMap.get(target).get(key)
 * dep -> {effect1, effect2, effect3, ...}
 * 执行的时候 effect.run()
 */
const targetMap = new Map();
function track(target, key) {
    // if (!activeEffect) return;
    // if (!shouldTrack) return;
    // 重构
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
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
function effect(fn, options = {}) {
    const { scheduler } = options;
    const _effect = new ReactiveEffect(fn, scheduler);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
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
        if (!isReadOnly) {
            track(target, key);
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

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOTS_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

// 创建组件实例
function createComponentInstance(vnode, parent) {
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
        parent,
        provides: parent ? parent.provides : {},
        props: {},
        subTree: {},
        isMounted: false,
        slots: {},
        emit: () => { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
// 处理组件实例
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    // 处理组件返回的状态
    setupStatefulComponent(instance);
}
// 只能在 setup 里面获取，所以只能在setup 里面赋值
let currentInstance = null;
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
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleStateupResult(instance, setupResult);
    }
}
function handleStateupResult(instance, setupResult) {
    // setup 结果可能是 obj 或 function
    if (typeof setupResult === "object") {
        instance.setupState = proxyRef(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    // 父组件
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        // init
        if (provides === parentProvides) {
            // 只能执行一次
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    // 子组件
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            else {
                return defaultValue;
            }
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContain) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContain);
            },
        };
    };
}

function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

const queue = [];
let isFlushPending = false;
let p = Promise.resolve;
function nextTick(fn) {
    return fn ? p().then(fn) : p();
}
function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}
function queueFlush() {
    if (isFlushPending) {
        return;
    }
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    let job;
    while ((job = queue.shift())) {
        job && job();
    }
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    function render(vnode, container, parentComponent) {
        // patch
        patch(null, vnode, container, parentComponent, null);
    }
    // n1 老的
    // n2 新的
    function patch(n1, n2, container, parentComponent, anchor) {
        // 当vnode.type的值时，组件是object，element是string，这样区分组件和元素
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                // if (typeof vnode.type === "string") {
                if (shapeFlag & 1 /* ELEMENT */) {
                    // patch element
                    processElement(n1, n2, container, parentComponent, anchor);
                    // } else if (isObject(vnode.type)) {
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    // patch 组件
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
        }
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const text = document.createTextNode(children);
        container.append(text);
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            // 包含初始化和更新流程
            // init
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            console.warn("update element");
            // 更新
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        const oldProps = n1.props;
        const nextProps = n2.props;
        const el = (n2.el = n1.el);
        // 更新属性
        patchProps(el, oldProps, nextProps);
        // 更新children
        patchChildren(n1, n2, el, parentComponent, anchor);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag;
        const { shapeFlag } = n2;
        const c1 = n1.children;
        const c2 = n2.children;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            if (prevShapeFlag & 8 /* ARRAY_CHILDREN */) {
                // 把老的children 清空
                unmountChildren(n1.children);
                // 设置 text
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            // new array
            if (prevShapeFlag & 4 /* TEXT_CHILDREN */) {
                hostSetElementText(container, "");
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                // array diff array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        /**
         * 1 左侧
         * abc  abde
         * 找到临点i 是 c1c2不同的索引
         * 如果两个节点相同则 i++
         * 节点基于 type 和 key 判断是否是同一节点
         * 如果是同一节点，那么进行属性的diff
         *
         */
        let i = 0;
        // let l2 = c2.length - 1;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        function isSameVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }
        // 只处理左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        // console.log(i);
        /**
         * 2 右侧相同
         * a bc, de bc
         *
         */
        // 只处理右侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // console.log(e1)
        // console.log(e2)
        /**
         * 3 新的比老的多，多在右侧
         * ab,ab cd
         * 找到临界点，直接创建就行
         *
         */
        // while (i > e1 && i <= e2) {
        //   const nextPos = i +1
        //   const anchor = i +1 > c2.length ? null: c2[nextPos].el
        //   patch(null, c2[i], container, parentComponent, anchor);
        //   i++;
        // }
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                let anchor = nextPos < c2.length ? c2[nextPos].el : null;
                // 或者下面的逻辑
                // let c2Have =c2[e2 + 1] ? c2[e2 + 1] : c2[nextPos];
                // let anchor = i + 1 < c2.length ? c2Have.el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            /**
             * 老的比新的多
             *
             */
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            // 中间对比
            let s1 = i;
            let s2 = i;
            /**
             * 在新的里面找一找 是否存在老节点
             * 不存在删掉 for 或者 key映射查找
             *
             * 优化如果新的已经patch完毕，老的还有，直接删除。patched > toBePatched
             */
            let toBePatched = e2 - s2 + 1;
            let patched = 0;
            const keyToNewIndexMap = new Map();
            /**
             * 移动逻辑
             * 在新的里面找到最长的递增子序列
             * 1 初始化映射关系
             */
            /**
             * 优化
             * 如果需要移动再求最长递归子序列，如果不需要直接为 []
             */
            let moved = false;
            let maxNewIndexSoFar = 0;
            const newIndexToOldIndexMap = new Array(toBePatched);
            for (let i = 0; i < toBePatched; i++) {
                newIndexToOldIndexMap[i] = 0;
            }
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            for (let i = s1; i <= e1; i++) {
                // console.log(111)
                // 看看老节点是否在新节点里面
                const prevChild = c1[i];
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIndex;
                if (prevChild.key !== null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    // 不存在 删除老节点
                    hostRemove(prevChild.el);
                }
                else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    // 存在 patch 相同的节点
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            // const increasingNewSequence = getSequence(newIndexToOldIndexMap);
            const increasingNewSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : [];
            // 需要倒序
            let j = increasingNewSequence.length;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    // 创建逻辑
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewSequence[j]) {
                        console.log("move");
                        // 确定位置 插入
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== newProps) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== {}) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { props, children, shapeFlag } = vnode;
        // string array
        // if (typeof children === "string") {
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        for (let key in props) {
            let val = props[key];
            // const isOn = (key: string) => /^on[A-Z]/.test(key);
            // if (isOn(key)) {
            //   const event = key.slice(2).toLowerCase();
            //   el.addEventListener(event, val);
            // } else {
            //   el.setAttribute(key, val);
            // }
            hostPatchProp(el, key, null, val);
        }
        // container.append(el);
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent, anchor);
        });
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        console.log(5555);
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            console.warn("update Component");
            instance.update();
        }
        else {
            // 不需要更新也要重置虚拟节点 和 el
            n2.el = n1.el;
            n2.vnode = n2;
        }
    }
    function mountComponent(initialVNode, container, parentComponent, anchor) {
        // 根据虚拟节点创建组件实例
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent));
        // 初始化，收集信息，instance挂载相关属性，方法, 装箱
        setupComponent(instance);
        // 渲染组件，调用组件的render方法
        // 组件 -> const App = {
        //   render() {
        //     return h("div", this.msg)
        //   },
        //   setup() {
        //     return {
        //       msg: "hello vue"
        //     }
        //   }
        // }
        // 一个组件不会真实渲染出来，渲染的是组件的render函数内部的element值，拆箱过程
        // render 返回的subTree 给patch，如果是组件继续递归，如果是element 则渲染
        setupRenderEffect(instance, initialVNode, container, anchor);
    }
    function setupRenderEffect(instance, initialVNode, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                // vnode -> element -> mountElement
                patch(null, subTree, container, instance, anchor);
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // console.warn("update");
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    // 更新属性
                    updateComponentPreRender(instance, next);
                }
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                // vnode -> element -> mountElement
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        }, {
            scheduler() {
                console.log('通过scheduler ...');
                queueJobs(instance.update);
            }
        });
    }
    // 更新属性
    function updateComponentPreRender(instance, next) {
        instance.vnode = next.vnode;
        next.vnode = null;
        instance.props = next.props;
    }
    return {
        createApp: createAppAPI(render),
    };
}
/**
 * @description 最长递增子序列
 * @author Werewolf
 * @date 2021-12-24
 * @param {*} arr
 * @return {*}
 */
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

// 基于 dom
function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextval) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextval);
    }
    else {
        if (nextval === undefined || nextval === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextval);
        }
    }
}
function insert(child, parent, anchor) {
    // parent.append(child);
    parent.insertBefore(child, anchor || null);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    setElementText,
    remove,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        /**
         * 如果是对象的话
         * set 逻辑里面  hasChanged(newValue, this._value) 一个是object，一个是isProxy，肯定不相等，所以这需要对比原始值
         * 原始值 _rawValue
         *
         */
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // if (hasChanged(newValue, this._value)) {
        if (hasChanged(newValue, this._rawValue)) {
            // 转换值
            this._value = convert(newValue);
            this._rawValue = newValue;
            triggerEffects(this.dep);
        }
    }
}
// 装换
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new RefImpl(value);
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function isRef(value) {
    return !!value.__v_isRef;
}
function unRef(value) {
    return isRef(value) ? value.value : value;
}
function proxyRef(obj) {
    return new Proxy(obj, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isRef = isRef;
exports.nextTick = nextTick;
exports.provide = provide;
exports.proxyRef = proxyRef;
exports.ref = ref;
exports.renderSlots = renderSlots;
exports.unRef = unRef;
