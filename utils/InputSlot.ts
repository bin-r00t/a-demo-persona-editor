interface InputSlotElement extends HTMLElement {
  inputSlot?: InputSlot;
}

export class InputSlot {}

export class InputSlotLine {
  id: string;
  value: string;
  mode: "singleline" | "textarea";
  placeholder: string;
  el: InputSlotElement | null;

  /**
   * value looks like: "abc {#InputSlot mode="input"#}你好{/#InputSlot#}{#InputSlot placeholder="世界" mode="input"#}{/#InputSlot#}"
   * should parse to:
   *  <div class="cm-line">
   *    "abc"
   *    <span class="input-slot" data-placeholder="Type here..." contenteditable="true">你好</span>
   *    <span class="input-slot" data-placeholder="世界" contenteditable="true"></span>
   *  </div>
   */

  constructor(
    value: string, // contains {#InputSlot}
    mode: "singleline" | "textarea" = "singleline",
    placeholder: string = "Type here...",
  ) {
    this.id = crypto.randomUUID();
    this.value = value;
    this.mode = mode;
    this.placeholder = placeholder;
    this.el = null;
    this.parseSlot();
  }

  private parseSlot() {
    // template
    const tmpl = document.createElement("template");
    // before & after character
    const headEmptyTextNode = document.createTextNode("&#8203;");
    const tailEmptyTextNode = document.createTextNode("&#8203;");

    // main content
    const span = document.createElement("span");
    span.classList.add("input-slot");
    span.setAttribute("data-placeholder", this.placeholder);
    span.setAttribute("contenteditable", "true");
    this.el = span;
    this.el.inputSlot = this; // for easy access

    // insert and mount
    tmpl.appendChild(headEmptyTextNode);
    tmpl.appendChild(span);
    tmpl.appendChild(tailEmptyTextNode);

    // more todos...

    return tmpl;
  }

  toHTML() {
    // return this.el ? this.el.outerHTML : "";
    return this.el ? this.el.innerHTML : "---error---";
  }

  toRaw() {}
}
