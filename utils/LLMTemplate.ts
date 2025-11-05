import { TemplateRow } from "./TemplateRow";

export interface LLMTemplateElement extends HTMLElement {
  _s_rel?: LLMTemplate;
}

export class LLMTemplate {
  el: LLMTemplateElement;
  templateString: string;
  content: (string | TemplateRow)[] = [];
  supportedRegex: { [key: string]: RegExp };

  constructor(el: HTMLElement, templateString: string) {
    this.el = el;
    this.el._s_rel = this;
    this.templateString = templateString;
    this.supportedRegex = {
      "#": new RegExp("^# (.*?)$", "gm"), // header one
      "##": new RegExp("^## (.*?)$", "gm"), // header two
      "###": new RegExp("^### (.*?)$", "gm"), // header three
      "**": new RegExp("\\*\\*(.*?)\\*\\*", "gm"), // bold
      "*": new RegExp("\\*(.*?)\\*", "gm"), // italic
      "~~": new RegExp("~~(.*?)~~", "gm"), // strikethrough
    };
    this.parseTemplateString();
  }

  parseTemplateString() {
    // console.log("[Template] ", this.templateString);
    const templateArr = this.templateString.split("\n");
    templateArr.forEach((line) => {
      const _line = new TemplateRow(line);
      this.content.push(_line);
      this.el.appendChild(_line.getHTML());
    });
  }

  containsInputSlot(line: string): boolean {
    const reg = /{#InputSlot([^#]*?)#}/;
    return reg.test(line);
  }

  getTextForLLM() {
    let result = "";
    this.content.forEach((item) => {
      if (typeof item === "string") {
        result += item + "\n";
      } else if (item instanceof TemplateRow) {
        result += item.getText() + "\n";
      }
    });
    return result.trim();
  }
}
