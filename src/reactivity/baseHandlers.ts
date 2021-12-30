import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadOnly = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly;
    }
    const res = Reflect.get(target, key);
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
export const mutableHandler = {
  get,
  set,
};
export const readonlyHandler = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`${key} 是 readonly`);
    return true;
  },
};
