import { h } from "../../lib/guide-mini-vue.esm.js"

export const Foo = {
  setup (props) {
    console.log(props)
    // this.props.count = 1
  },
  render() {
    return h("div",{},"foo-props: "+ this.count)
  }
}