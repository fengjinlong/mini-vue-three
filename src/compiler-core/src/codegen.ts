export function generate(ast) {
  // return {
  //   code: `return function render(_ctx, _cache) {return "hi"}`,
  // };

  const context = createCodegenContext();
  const { push } = context;
  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");
  push(`return function ${functionName}(${signature}) {`);
  push("return ");
  genNode(ast.codegenNode, context);
  push("}");
  return {
    code: context.code,
  };
}
function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
  };
  return context;
}
function genNode(
  node: any,
  context: { code: string; push(source: any): void }
) {
  const { push } = context;
  push(`"${node.content}"`);
}
