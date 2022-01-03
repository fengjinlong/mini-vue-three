import { render } from "./renderer";
import { createVNode } from "./vnode";

export function createApp(rootComponent) {
  return {
    mount(rootContain) {
      const vnode = createVNode(rootComponent);
      render(vnode, rootContain);
    },
  };
}
