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
  } else if (s[0] === "<") {
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context);
    }
  }
  nodes.push(node);
  return nodes;
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
const enum TagType {
  Start,
  End,
}
function parseElement(context: any) {
  const element = parseTag(context, TagType.Start);
  parseTag(context, TagType.End);
  console.log("---" + context.source);
  return element;
}
function parseTag(context: any, type: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceBy(context, 1);
  if (type === TagType.End) return;
  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}
