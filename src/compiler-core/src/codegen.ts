import { isString } from "../../shared";
import { NodeTypes } from "./ast";
import {
  CREATE_ELEMENT_VNODE,
  helperMapName,
  TO_DISPLAY_STRING,
} from "./runtimeHelpers";

export function generate(ast) {
  // return {
  //   code: `return function render(_ctx, _cache) {return "hi"}`,
  // };

  const context = createCodegenContext();
  const { push } = context;

  genFunctionPreamble(ast, context);
  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");
  push(`function ${functionName}(${signature}) {`);
  push("return ");
  genNode(ast.codegenNode, context);
  push("}");
  return {
    code: context.code,
  };
}
function genFunctionPreamble(ast: any, context: any) {
  const { push } = context;
  const VueBinging = "Vue";
  if (ast.helpers.length) {
    const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`;
    push(
      `const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${VueBinging}`
    );
    push("\n");
  }
  push("return ");
}

function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `_${helperMapName[key]}`;
    },
  };
  return context;
}
function genNode(
  node: any,
  context: { code: string; push(source: any): void }
) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;
  }
}
function genCompoundExpression(node, context) {
  const { push } = context;
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isString(child)) {
      push(child);
    } else {
      genNode(child, context);
    }
  }
}
function genElement(node, context) {
  const { push, helper } = context;
  const { tag, children, props } = node;
  // const child = children[0];
  // push(`${helper(CREATE_ELEMENT_VNODE)}("${tag}"), null, "hi, " + _toDisplayString(_ctx.message), 1 /* TEXT */`)
  push(`${helper(CREATE_ELEMENT_VNODE)}(`);
  genNodeList(genNullable([tag, props, children]), context);
  // genNode(children, context); 不支持数组
  push(")");
}
function genNodeList(nodes, context) {
  let { push } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isString(node)) {
      push(node);
    } else {
      genNode(node, context);
    }

    if (i < nodes.length - 1) {
      push(", ");
    }
  }
}
function genNullable(args) {
  return args.map((a) => a || "null");
}
function genText(
  node: any,
  context: { code: string; push(source: any): void }
) {
  const { push } = context;
  push(`"${node.content}"`);
}

function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  console.log(node);
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(")");
}

function genExpression(
  node: any,
  context: { code: string; push(source: any): void }
) {
  const { push } = context;
  push(`${node.content}`);
}
