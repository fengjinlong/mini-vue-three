import { effect } from "../effect"
import { readonly } from "../reactive"

test('readonly array should not track', () => {
  const arr = [1]
  const roArr = readonly(arr)

  const eff = effect(() => {
    roArr.includes(2)
  })
  // expect(eff.deps.length).toBe(0)
})