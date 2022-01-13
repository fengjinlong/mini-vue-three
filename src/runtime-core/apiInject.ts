import { getCurrentInstance } from "./components";

export function provide(key, value) {
  // 父组件
  const currentInstance: any = getCurrentInstance();
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
export function inject(key, defaultValue) {
  // 子组件
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;
    if (key in parentProvides) {
      return parentProvides[key];
    } else if (defaultValue) {
      if (typeof defaultValue === "function") {
        return defaultValue();
      } else {
        return defaultValue;
      }
    }
  }
}
