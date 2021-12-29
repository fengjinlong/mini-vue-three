class ReactiveEffect {
  private _fn: any;
  constructor(fn: any, public scheduler?) {
    this._fn = fn;
    // this.scheduler = scheduler;
  }
  run() {
    activeEffect = this
    // return 是为了拿到 runner() 的返回结果
    return this._fn();
  }
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
  dep.add(activeEffect);
}

export function trigger(target: any, key: any) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  for(const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
    
  }
}

let activeEffect: any;
export function effect(fn: any, options: any={}) {
  const {scheduler} = options;
  const _effect = new ReactiveEffect(fn, scheduler);
  _effect.run();
  return _effect.run.bind(_effect)
}
