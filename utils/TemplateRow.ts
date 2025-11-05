/**
 * parse "abc {#InputSlot mode="input"#}你好{/#InputSlot#}{#InputSlot placeholder="世界" mode="input"#}{/#InputSlot#}"
 * to:
 *  <template>
 *    "abc"
 *    <span class="input-slot" data-placeholder="Type here..." contenteditable="true">你好</span>
 *    <span class="input-slot" data-placeholder="世界" contenteditable="true"></span>
 *  </template>
 */
import { InputSlot } from "./InputSlotV2";

type TextNode = {
  type: "text";
  content: string;
};

type InputSlotNode = {
  type: "input-slot";
  attributes: { [key: string]: string };
  content: string;
  inputSlot: InputSlot;
};

interface TemplateRowAST {
  type: "root";
  content: (TextNode | InputSlotNode)[];
}

interface HTMLElementWithTemplateRowAST extends HTMLElement {
  _s_rel?: TemplateRow;
}

export class TemplateRow {
  rawString: string;
  ast: TemplateRowAST;
  parsedSlots: InputSlot[];
  el: HTMLElementWithTemplateRowAST;

  constructor(rawString: string) {
    this.rawString = rawString;
    this.parsedSlots = [];
    this.el = document.createElement("div");
    this.el._s_rel = this;
    this.ast = this.templateToAST(rawString);
  }

  //   private parseRow() {
  //     const inputSlotRegex = /{#InputSlot(.*?)#}(.*?){\/#InputSlot#}/g;
  //     let match;
  //     while ((match = inputSlotRegex.exec(this.rawString)) !== null) {
  //       const attributes = match[1];
  //       const content = match[2];
  //       const inputSlot = new InputSlot(attributes, content);
  //       this.parsedSlots.push(inputSlot);
  //     }
  //   }

  private templateToAST(rawString: string): TemplateRowAST {
    /** the rawString looks like this: abc {#InputSlot mode="input" placeholder="asdf"#} content {/#InputSlot#} dfe*/
    const inputNodeRegex = /{#InputSlot(.*?)#}(.*?){#\/InputSlot#}/g;
    const existsRegex = /{#InputSlot.*?#}/;
    const ast: TemplateRowAST = { type: "root", content: [] };
    let lastIndex = 0;
    let match;

    /** 如果不存在，直接返回 */
    if (!existsRegex.test(rawString)) {
      ast.content.push({ type: "text", content: rawString });
      return ast;
    }

    // const matches = [...rawString.matchAll(inputNodeRegex)];

    // console.log("matches:", rawString,  matches);
    // for (const match of rawString.matchAll(inputNodeRegex)) {
    //   console.log(match[0]); // full match
    //   console.log(match[1]); // first capture group
    //   console.log(match[2]); // second capture group
    //   console.log(match.index); // start position
    // }

    while ((match = inputNodeRegex.exec(rawString)) !== null) {
      const [fullMatch, attributes, content] = match;
      const startIndex = match.index;
      const endIndex = inputNodeRegex.lastIndex;

      // Push any text before the match as a text node
      if (startIndex > lastIndex) {
        ast.content.push({
          type: "text",
          content: rawString.slice(lastIndex, startIndex),
        });
      }

      // Push the input slot node
      const _attr = this.parseAttributes(attributes);
      ast.content.push({
        type: "input-slot",
        attributes: _attr,
        content,
        inputSlot: new InputSlot(content, _attr),
      });

      lastIndex = endIndex;
    }

    // Push any remaining text after the last match
    if (lastIndex < rawString.length) {
      ast.content.push({
        type: "text",
        content: rawString.slice(lastIndex),
      });
    }

    return ast;
  }

  parseAttributes(attributeString: string): { [key: string]: string } {
    const attributes: { [key: string]: string } = {};
    const attrRegex = /(\w+)=\"(.*?)\"/g;
    let match;

    while ((match = attrRegex.exec(attributeString)) !== null) {
      const [, key, value] = match;
      //   console.log("[Parsed Attribute]", key, value);
      attributes[key] = value;
    }

    return attributes;
  }

  getHTML() {
    /** generate HTML from this.ast */
    const content = this.ast.content;
    this.el.classList.add("cm-line");
    /** span - markdown header (if had) */
    let span = document.createElement("span");
    span.classList.add("markdown-header");

    if (
      this.rawString.trim().startsWith("# ") ||
      this.rawString.trim().startsWith("## ") ||
      this.rawString.trim().startsWith("### ")
    ) {
      content.forEach((node) => {
        if (node.type === "text") {
          span.appendChild(document.createTextNode(node.content));
        } else if (node.type === "input-slot") {
          console.log("[Input Slot Node]", node);
          const inputSlot = node.inputSlot;
          inputSlot.handOverDom(span);
        }
      });
      this.el.appendChild(span);
    } else {
      content.forEach((node) => {
        if (node.type === "text") {
          this.el.appendChild(document.createTextNode(node.content));
        } else if (node.type === "input-slot") {
          console.log("[Input Slot Node]", node);
          const inputSlot = node.inputSlot;
          inputSlot.handOverDom(this.el);
        }
      });
    }

    return this.el;
  }

  getText(): string {
    console.log("getText", this.ast);
    return "";
  }
}
