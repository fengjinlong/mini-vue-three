import {
  mutableHandler,
  readonlyHandler,
  shallowReadonlyHandlers,
} from "./baseHandlers";
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadOnly",
}
export function reactive(raw: any) {
  return createActiveObject(raw, mutableHandler);
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandler);
}
export function isReadOnly(value: any) {
  return !!value[ReactiveFlags.IS_READONLY];
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandlers);
}

export function isProxy(value) {
  return isReadOnly(value) || isReactive(value);
}
function createActiveObject(raw: any, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}
