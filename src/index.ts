// minivue 出口
export * from "./runtime-dom";
export * from "./reactivity";

import { baseCompile } from "./compiler-core/src";
import * as runtimeDom from "./runtime-dom";
import {registerRuntimeCompile} from "./runtime-dom";

function compileToFunction(template) {
  const { code } = baseCompile(template);
  // code
  // const { openBlock: _openBlock, createElementBlock: _createElementBlock } = Vue
  // return function render(_ctx, _cache, $props, $setup, $data, $options) {
  //   return (_openBlock(), _createElementBlock("div"))
  // }
  const render = new Function("Vue", code)(runtimeDom);
  return render;
}
registerRuntimeCompile(compileToFunction);
