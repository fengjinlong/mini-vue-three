import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";
import { hasChange, isObject } from "./shared";

class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  constructor(value) {
    /**
     * 如果是对象的话
     * set 逻辑里面  hasChange(newValue, this._value) 一个是object，一个是isProxy，肯定不相等，所以这需要对比原始值
     * 原始值 _rawValue
     *
     */
    this._rawValue = value;

    this._value = convert(value);
    this.dep = new Set();
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue: any) {
    // if (hasChange(newValue, this._value)) {
    if (hasChange(newValue, this._rawValue)) {
      // 转换值
      this._value = convert(newValue);
      this._rawValue = newValue;
      triggerEffects(this.dep);
    }
  }
}
// 装换
function convert(value: any) {
  return isObject(value) ? reactive(value) : value;
}
export function ref(value) {
  return new RefImpl(value);
}
function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}
