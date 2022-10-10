import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";
import { extend, isObject } from "../shared/index";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

function createGetter(isReadOnly = false, shallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly;
    }

    const res = Reflect.get(target, key);
    if (shallow) {
      return res;
    }
    if (isObject(res)) {
      return isReadOnly ? readonly(res) : reactive(res);
    }
    if (!isReadOnly) {
      console.log("track key --- ", key);

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
export const shallowReadonlyHandlers = extend({}, readonlyHandler, {
  get: shallowReadonlyGet,
});
