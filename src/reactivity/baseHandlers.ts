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
      // console.log("track key --- ", key);

      track(target, key);
    }
    return res;
  };
}
function createSetter(isReadOnly = false) {
  return function set(target, key, value) {
    // console.log("old", target[key]);

    // for length
    const oldVal = target[key];

    const res = Reflect.set(target, key, value);
    // console.log("n", Number(key));
    // console.log("key", key);

    // console.log("new", value);

    // console.log("bbb", value === target[key]);

    const type = Array.isArray(target)
      ? Number(key) < target.length
        ? "SET"
        : "ADD"
      : "";

    // console.log("value", value);
    if (oldVal !== value) {
      trigger(target, key, type, value);
    } else {
      trigger(target, key, type);
    }

    return res;
  };
}
export const mutableHandler = {
  ownKeys(target) {
    console.log("dddddd", target);

    track(target, Array.isArray(target) ? "length" : "ITERATE_KEY");
    return Reflect.ownKeys(target);
  },
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
