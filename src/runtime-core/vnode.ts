export function createVNode(type, props?, children?) {
  const vndoe = {
    type,
    props,
    children,
  };
  return vndoe;
}
