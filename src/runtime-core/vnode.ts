export function createVNode(type, props?, children?) {
  const vndoe = {
    type,
    props,
    children,
    el:null
  };
  return vndoe;
}
