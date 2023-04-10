import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);

    user.age++;
    expect(nextAge).toBe(12);
  });
  it("runner", () => {
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return "foo";
    });
    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe("foo");
  });

  it("scheduler", () => {
    /**
     * effect(fn, {scheduler: fn2})
     *
     * 1 通过 effect 的第二个参数给定的 一个 scheduler 的 fn2
     * 2 effect 第一次执行的时候 还会执行 fn，
     * 3 当响应式对象 set update 不会执行 fn,而是执行 fn2
     * 4 如果执行 runner，会再次执行 fn
     *
     */

    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });

    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(2);
  });

  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    obj.prop++;
    expect(dummy).toBe(2);

    runner();
    expect(dummy).toBe(3);
  });
  it("onStop", () => {
    const obj = reactive({
      foo: 1,
    });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        () => {
          dummy = obj.foo;
        };
      },
      { onStop }
    );
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});
describe("array", () => {
  it("arr", () => {
    // array
    const arr = reactive(["foo"]);
    let e = "";
    effect(() => {
      e = arr[0];
    });
    arr[0] = "bar";
    expect(e).toBe("bar");
  });
  it("arr", () => {
    // array
    const arr = reactive(["foo"]);
    let e = 3;
    effect(() => {
      // console.log("length --- ", arr[0]);

      e = arr.length;
    });
    // arr[1] = "bar";
    arr.length = 0;
    expect(e).toBe(0);
    arr.length = 10;
    expect(e).toBe(10);
  });
  it("length变为0，arr[0] 触发依赖", () => {
    // array
    const arr = reactive(["foo"]);
    let e = arr[0];
    effect(() => {
      e = arr[0];
    });
    arr.length = 0;
    console.log("eee", e);

    // expect(e).toBe(undefined);
  });
  it.only("ownKeys", () => {
    // array
    const arr = reactive(["foo", "q"]);
    effect(() => {
      for (const key in arr) {
        console.log("ss2s", key);
      }
    });
    arr.length = 10;

    // expect(e).toBe(undefined);
  });
});
