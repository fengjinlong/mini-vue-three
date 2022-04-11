import { NodeTypes } from "./ast";

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context, ""));
}

function createParserContext(content: string) {
  return {
    source: content,
  };
}
function parseChildren(context, parentTag): any {
  const nodes: any = [];
  let str = !isEnd(context, parentTag) 
  while (!isEnd(context, parentTag)) {
    let node;
    let s = context.source;
    
    if (s.startsWith("{{")) {
      node = parseInterpolation(context);
    } else if (s[0] === "<") {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context);
      }
    }
    if (!node) {
      node = parseText(context);
    }
    nodes.push(node);
  }
  return nodes;
}
function isEnd(context, parentTag) {
  const s = context.source;
  if (parentTag && s.startsWith(`</${parentTag}>`)) {
    return true;
  }
  return !context.source;
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
  const rawContent = parseTextData(context, rawContentLength);
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
  const element: any = parseTag(context, TagType.Start);
  parseTag(context, TagType.End);
  element.children = parseChildren(context, element.tag);
  return element;
}
function parseTag(context: any, type: TagType) {
  console.log(context.source)
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  if (!match) return
  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceBy(context, 1);
  if (type === TagType.End) return;
  console.log(tag)
  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}
function parseText1(context: any): any {
  let endIndex = context.source.length;
  let endTokens = ["<", "{{"];
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i]);
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }
  const content = parseTextData(context, endIndex);
  return {
    type: NodeTypes.TEXT,
    content,
  };
}
function parseText(context: any) {
  let endIndex = context.source.length;
  let endTokens = ["<", "{{"];
  // let endTokens = "{{";

  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i]);
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }
  // const index = context.source.indexOf(endTokens)
  // if (index !== -1) {
  //   endIndex = index;
  // }

  const content = parseTextData(context, endIndex);
  // console.log(content);
  // return

  return {
    type: NodeTypes.TEXT,
    content,
  };
}
function parseTextData(context: any, length) {
  const content = context.source.slice(0, length);
  advanceBy(context, length);
  return content;
}
