import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";

describe("Parse", () => {
  // describe("interpolation", () => {
  //   test("interpolation", () => {
  //     const ast = baseParse("{{message}}");
  //     expect(ast.children[0]).toStrictEqual({
  //       type: NodeTypes.INTERPOLATION,
  //       content: {
  //         type: NodeTypes.SIMPLE_EXPRESSION,
  //         content: "message",
  //       },
  //     });
  //   });
  // });

  describe("element", () => {
    it("simple element div", () => {
      const ast = baseParse("<div><p></p></div>");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
        children: [
         {
          type: NodeTypes.ELEMENT,
          tag: "p",
         } 
        ],
      });
    });
  });

  // describe("text", () => {
  //   it("simple text", () => {
  //     const ast = baseParse("some text");

  //     expect(ast.children[0]).toStrictEqual({
  //       type: NodeTypes.TEXT,
  //       content: "some text",
  //     });
  //   });
  // });

  // test("hello world", () => {
  //   const ast = baseParse("<div>hi,{{message}}</div>");

  //   expect(ast.children[0]).toStrictEqual({
  //     type: NodeTypes.ELEMENT,
  //     tag: "div",
  //     children: [
  //       {
  //         type: NodeTypes.TEXT,
  //         content: "hi,",
  //       },
  //       {
  //         type: NodeTypes.INTERPOLATION,
  //         content: {
  //           type: NodeTypes.SIMPLE_EXPRESSION,
  //           content: "message",
  //         },
  //       },
  //     ],
  //   });
  // });

  // test.skip("Nested element ", () => {
  //   const ast = baseParse("<div><p>hi</p>{{message}}</div>");

  //   expect(ast.children[0]).toStrictEqual({
  //     type: NodeTypes.ELEMENT,
  //     tag: "div",
  //     children: [
  //       {
  //         type: NodeTypes.ELEMENT,
  //         tag: "p",
  //         children: [
  //           {
  //             type: NodeTypes.TEXT,
  //             content: "hi",
  //           },
  //         ],
  //       },
  //       {
  //         type: NodeTypes.INTERPOLATION,
  //         content: {
  //           type: NodeTypes.SIMPLE_EXPRESSION,
  //           content: "message",
  //         },
  //       },
  //     ],
  //   });
  // });
});
