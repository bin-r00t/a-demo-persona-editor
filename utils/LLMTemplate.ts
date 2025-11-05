import { InputSlotLine } from "./InputSlot";

export interface ModalItem {
  type: "input-slot";
  id: string;
  value: string;
  mode: "singleline" | "textarea";
  placeholder: string;
}

export class LLMTemplate {
  el: HTMLElement;
  templateString: string;
  supportedRegex: { [key: string]: RegExp };

  constructor(el: HTMLElement, templateString: string) {
    this.el = el;
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
    console.log("[Template] ", this.templateString);
    const templateArr = this.templateString.split("\n");
    templateArr.forEach((line) => {
      console.log("[Template Line] ", line);
      this.parseTemplateLine(line);
    });
  }

  parseTemplateLine(line: string) {
    const divEl = document.createElement("div");
    divEl.classList.add("cm-line");
    line = line.trim();

    /** if line contains # or ## or ###, wrap it with a markdown-header class span */
    if (
      line.startsWith("# ") ||
      line.startsWith("## ") ||
      line.startsWith("### ")
    ) {
      const spanEl = document.createElement("span");
      spanEl.classList.add("markdown-header");
      spanEl.innerHTML = this.parseLineContent(line);
      divEl.appendChild(spanEl);
      console.log("[Extracted Text]", spanEl.innerText);
    } else if (this.containsInputSlot(line)) {
      const inputSlotsLineTemplate = this.parseLineContent(line);
      console.log("[Extracted Input Slots]");
      divEl.innerHTML = inputSlotsLineTemplate; 
    } else {
      divEl.appendChild(document.createTextNode(this.parseLineContent(line)));
      console.log("[Extracted Text]", line);
    }

    this.el.appendChild(divEl);
  }

  containsInputSlot(line: string): boolean {
    const reg = /{#InputSlot([^#]*?)#}/;
    return reg.test(line);
  }

  parseLineContent(line: string): string {
    if (!this.containsInputSlot(line)) {
      return line;
    }
    /**
     * parse "abc {#InputSlot mode="input"#}你好{/#InputSlot#}{#InputSlot placeholder="世界" mode="input"#}{/#InputSlot#}"
     * to:
     *  <template>
     *    "abc"
     *    <span class="input-slot" data-placeholder="Type here..." contenteditable="true">你好</span>
     *    <span class="input-slot" data-placeholder="世界" contenteditable="true"></span>
     *  </template>
     */
    const inputSlotLineTemplate = new InputSlotLine(line);
    
    return inputSlotLineTemplate.toHTML();
  }

  parseInputSlots(line: string): string[] {
    return [];
  }

  parseToModel(markdown: string): (ModalItem | string)[] {
    return [];
  }

  parseFromModel(model: (ModalItem | string)[]): string {
    return "";
  }

  getTextForLLM() {
    return this.el.innerText;
  }
}
