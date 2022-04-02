import { NodeTypes } from "./ast";

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
}

function createParserContext(content: string) {
  return {
    source: content,
  };
}
function parseChildren(context): any {
  const nodes: any = [];
  let node;
  let s = context.source;

  if (s.startsWith("{{")) {
    node = parseInterpolation(context);
  }
  nodes.push(node);
  return nodes
}

function createRoot(children) {
  return {
    children,
  };
}

function parseInterpolation(context: any): any {
  // {{message}}
  const openDelimiter = "{{";
  const closeDelimiter = "}}";
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );
  
  advanceBy(context, openDelimiter.length);
  
  const rawContentLength = closeIndex - openDelimiter.length;
  
  // const rawContent = parseTextData(context, rawContentLength);
  const rawContent = context.source.slice(0, rawContentLength);
  const content = rawContent.trim();
  
  advanceBy(context, closeDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  };
}
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}
