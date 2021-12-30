import { extend } from "./shared";

let activeEffect: any;
let shouldTrack: any;
class ReactiveEffect {
  private _fn: any;
  deps = [];
  onStop?: () => void;
  // active 避免重复清空
  active = true;
  constructor(fn: any, public scheduler?) {
    this._fn = fn;
    // this.scheduler = scheduler;
  }
  run() {
    if (!this.active) {
      // stop 状态
      return this._fn();
    }

    shouldTrack = true;
    activeEffect = this;

    const res = this._fn();
    shouldTrack = false;
    // return 是为了拿到 runner() 的返回结果
    return res;
  }
  stop() {
    if (this.active) {
      if (this.onStop) {
        this.onStop();
      }
      cleanupEffect(this);
      this.active = false;
    }
  }
}
function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}
/**
 * dep依赖 是唯一的，用 Set
 * target 对应 key, key 对应 dep
 * dep = targetMap.get(target).get(key)
 * dep -> {effect1, effect2, effect3, ...}
 * 执行的时候 effect.run()
 */
const targetMap = new Map();
export function track(target: any, key: any) {
  // if (!activeEffect) return;
  // if (!shouldTrack) return;
  if (!isTracking()) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trigger(target: any, key: any) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn: any, options: any = {}) {
  const { scheduler } = options;
  const _effect = new ReactiveEffect(fn, scheduler);
  extend(_effect, options);
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
export function stop(runner) {
  runner.effect.stop();
}
