import { hasOwn } from "../shared/index";

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
  $props: (i) => i.props,
};
export const PublicInstanceProxyHandlers = {
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
