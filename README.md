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
### getCurrentInstance 只能在setup 里面用，所有只能在setup 逻辑里面赋值
### provide inject
1. provide inject 就是把数据存到当前组件实例对象，然后在取出来。既然要用实例，那肯定是 在setup 里面调用的。
2. 只不过就是 一个在父组件存 一个在子组件取
