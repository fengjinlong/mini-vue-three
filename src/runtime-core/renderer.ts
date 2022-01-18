import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./components";
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";
import { effect } from "../reactivity/effect";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;
  function render(vnode, container, parentComponent) {
    // patch
    patch(null, vnode, container, parentComponent, null);
  }

  // n1 老的
  // n2 新的
  function patch(n1, n2, container: any, parentComponent, anchor) {
    console.log("patch ", anchor);
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
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // patch element
          processElement(n1, n2, container, parentComponent, anchor);
          // } else if (isObject(vnode.type)) {
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // patch 组件
          processComponent(n1, n2, container, parentComponent, anchor);
        }
    }
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2;
    const text = document.createTextNode(children);
    container.append(text);
  }

  function processFragment(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processElement(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    if (!n1) {
      // 包含初始化和更新流程
      // init
      mountElement(n2, container, parentComponent, anchor);
    } else {
      // 更新
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }
  function patchElement(n1, n2: any, container: any, parentComponent, anchor) {
    const oldProps = n1.props;
    const nextProps = n2.props;
    const el = (n2.el = n1.el);
    // 更新属性
    patchProps(el, oldProps, nextProps);
    // 更新children
    patchChildren(n1, n2, el, parentComponent, anchor);
  }
  function patchChildren(n1: any, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag;
    const { shapeFlag } = n2;
    const c1 = n1.children;
    const c2 = n2.children;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 把老的children 清空
        unmountChildren(n1.children);
        // 设置 text
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      // new array
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }
  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
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
      } else {
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
      } else {
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
    } else if (i > e2) {
      /**
       * 老的比新的多
       *
       */
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
  }

  function patchProps(el, oldProps: any, newProps: any) {
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

  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    const el = (vnode.el = hostCreateElement(vnode.type));

    const { props, children, shapeFlag } = vnode;
    // string array
    // if (typeof children === "string") {
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
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
  function processComponent(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountComponent(n2, container, parentComponent, anchor);
  }

  function mountComponent(
    initialVNode: any,
    container: any,
    parentComponent,
    anchor
  ) {
    // 根据虚拟节点创建组件实例
    const instance = createComponentInstance(initialVNode, parentComponent);

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
  function setupRenderEffect(
    instance: any,
    initialVNode: any,
    container,
    anchor
  ) {
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance, anchor);
        initialVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
        console.warn("update");

        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;

        // vnode -> element -> mountElement
        instance.subTree = subTree;
        patch(prevSubTree, subTree, container, instance, anchor);
      }
    });
  }
  return {
    createApp: createAppAPI(render),
  };
}
