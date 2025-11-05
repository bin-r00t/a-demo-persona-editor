export interface InputSlotElement extends HTMLSpanElement {
  _s_rel?: InputSlot;
}

function insertZeroEmptyBeforeAndAfter(el: HTMLElement) {
  console.log("parent node", el.parentNode);
  // Before character: zero-width space for cursor positioning
  el.parentNode?.insertBefore(document.createTextNode("\u200B"), el);
  // After character: zero-width space for cursor positioning
  el.parentNode?.insertBefore(
    document.createTextNode("\u200B"),
    el.nextSibling,
  );
}

export class InputSlot {
  _parent_div = document.createDocumentFragment();
  el: InputSlotElement | null;
  content: string;
  attributes: { [key: string]: string };

  constructor(content: string, attributes?: { [key: string]: string }) {
    this.content = content;
    this.attributes = attributes || {};
    this.el = document.createElement("span") as InputSlotElement;
    this.el.classList.add("input-slot");
    this.el.contentEditable = "true";
    this.el._s_rel = this;
    this._parent_div.appendChild(this.el);
    insertZeroEmptyBeforeAndAfter(this.el);
    /** 输入事件 */
    this.el.addEventListener("blur", (e) => {
      console.log("inner blur event.....", e.target);
      const target = e.target as HTMLElement;
      this.updateContent(target.innerText);
    });

    // Or use DOMSubtreeModified (deprecated but works)
    // this.el.addEventListener("DOMSubtreeModified", (e) => {
    //   console.log("inner DOM modified event.....", e);
    //   const target = e.target as HTMLElement;
    //   this.updateContent(target.innerText);
    // });

    /** 可扩展的地方: */
    Object.entries(attributes || {}).forEach(([key, value]) => {
      if (key === "placeholder") {
        this.el!.setAttribute("data-placeholder", value);
      }
    });
  }

  updateContent(newContent: string) {
    this.content = newContent;
  }

  getText(): string {
    const res = "{#InputSlot ";
    const attrStr = Object.entries(this.attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ");
    return `${res}${attrStr}#}${this.content}{/#InputSlot#}`;
  }

  getDom(): string {
    if (!this.el) return "";
    return this.el.outerHTML;
  }

  handOverDom(parent: HTMLElement) {
    if (!this.el) return;
    parent.appendChild(this._parent_div);
  }
}
