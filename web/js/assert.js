export function assertLt(value, expect, messages) {
  if (value > expect) {
    console.error("Value is less then expect" + messages)
  }
}
