import { isReadOnly, reactive, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  it("最外层是 readonly", () => {
    const warpped = shallowReadonly({ n: { foo: 1 } });
    expect(isReadOnly(warpped)).toBe(true);
    expect(isReadOnly(warpped.n)).toBe(false);
  });
});
