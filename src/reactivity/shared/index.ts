export const extend = Object.assign
export const isObject = (val) => {
  return val !== null && typeof val === "object"
}
export const hasChange = (a,b) => {
  return !Object.is(a,b)
}