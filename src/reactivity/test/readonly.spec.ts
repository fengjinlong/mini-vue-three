import { isReadOnly, reactive, readonly } from "../reactive";

describe("readonly", () => {
  it("should make nested values readonly", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const warpped = reactive(original);
    expect(warpped).not.toBe(original);
  });
  
  it("warn", () => {
    console.warn = jest.fn();
    const user = readonly({ age: 10 });
    user.age = 11;
    expect(isReadOnly(user)).toBe(true)
    expect(console.warn).toBeCalled();
  });
});
