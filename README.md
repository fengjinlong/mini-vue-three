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
#### 3 
```typescript
// 流程
createApp -> render -> patch -> 区分patch啥（1 patch text，2 patch element，3 patch component）
```
#### 2 patch 组件流程
- 初始化
```typescript
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
```
- 更新