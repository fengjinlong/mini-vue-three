#### 1 响应式流程

```typescript
setup () {
  // 1 创建响应式对象，此时并没有出发，定义对象的 get set 等操作
  const proxyObj = reacetive({
    n: 1,
  })
  let m;
  // 2
  /**
   * effect的创建，执行 effect.run()
   * 由于执行 proxyObj.n 触发proxyOjb的定义get操作，收集到跟n相关的依赖 effect实例，
   * 此时 m = 1
   *
  */
  effect(() => {
    m = proxyObj.n
  })

  // 3
  /**
   * 赋值操作 触发proxyObj定义的set 操作
   * 找到跟n相关的依赖，effect实例，并执行 effect.run()
   * m 更新为 2
  */
  proxyObj.n = 2

  return {

  }
}
```

#### 2

```typescript
// 初始化流程
createApp -> render -> patch -> 区分patch啥（1 patch text，2 patch element，3 patch component）

// 更新流程

```

#### 3 patch 组件流程

- 组件初始化

```typescript
patch
mountComponent 适合创建 instance 对象

instancce -> {
  ctx,
  emit
  inMounted
  next
  parent
  props
  provides
  proxy
  setupState
  slots
  type -> {组件}
  vnode
}

// TODO 对比mini-vue具体简单分析一下各个属性，主要流程
```

- 组件更新

#### 初始项目搭建

1. 安装依赖

```typescript
// jest
"@types/jest": "^27.0.3",
"jest": "^27.4.5"

// tsconfig.json
"type": ["jest"]

// jest 默认是nodejs 环境，也就是commonjs 规范，需要用babel转换成esm规范
// 依赖
yarn add --dev @babel/preset-typescript babel-jest @babel/core @babel/preset-env
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript',
  ],
};
```

## 补充

### getCurrentInstance 只能在 setup 里面用，所有只能在 setup 逻辑里面赋值

### provide inject

1. provide inject 就是把数据存到当前组件实例对象，然后在取出来。既然要用实例，那肯定是 在 setup 里面调用的。
2. 只不过就是 一个在父组件存 一个在子组件取

3. 更新属性的本质就是虚拟 dom 的对比更新
   调用 render 函数会生成虚拟 dom，也就是，响应式数据的更新要触发 render，也就是 用 effect 包裹 render

4. 双端对比就是找到左侧和右侧相同的部分，然后处理中间乱序的部分，有以下场景

- 只有左侧相同
- 只有右侧相同
- 新的比老的多，多在左侧
- 新的比老得多，多在右侧
- 老的比新的长，多的在左侧
- 老的比新的长，多的在右侧
- 左右都有，处理中间的，最复杂的

- 在处理中间部分时候，如果在新的里面判断是否有老的，可以用遍历，但是用遍历时间复杂度是 O(n), 用 key 映射的话 时间复杂度是 O(1)
-

## 双端对比 patch

- 找左侧相同的节点，进行 patch，确定 i
- 找右侧相同的节点，进行 patch，确定 e1 e2
- 确定 i e1 e2 后，处理新老个数问题
  - 新的多
    - 多在左侧
    - 多在右侧
  - 老的多
    - 多在左侧
    - 多在右侧
- 处理中间不同的节点
  - 利用 keyMap 映射，一个老节点是否在新节点里。用户没有传 key 的话，用遍历循环
    - 找到不在新节点的，直接删除
    - 在新节点里面，进行 patch
    - 移动的逻辑

## 组件更新

- 就是再次调用 render，也就是调用 effect 的返回值
- 调用时候需要更新组件的 props,也就是将 新的虚拟节点的 props 赋值给 当前组件的 props
- 组件更新优化点，如果两个虚拟节点的 props 相同，那就没有必要记性组件的更新

## nextTick
- 同步的更新不能立即执行
- 通过scheduler 控制更新时机
