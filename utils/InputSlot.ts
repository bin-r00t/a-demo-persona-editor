interface InputSlotElement extends HTMLTemplateElement {
  inputSlot?: InputSlot;
}

export class InputSlot {
  id: string;
  slotString: string; // e.g., "{#InputSlot mode="input"#}你好{/#InputSlot#}"
  mode: "singleline" | "textarea";
  placeholder: string;
  content: string;
  el: DocumentFragment | null;

  constructor(slotString: string) {
    this.id = crypto.randomUUID();
    this.slotString = slotString;
    this.mode = "singleline";
    this.placeholder = "Type here...";
    this.content = "";
    this.el = null;
    this.parse();
  }

  private parse() {
    // Parse the slot string to extract attributes and content
    // Example: "{#InputSlot mode="input" placeholder="世界"#}你好{/#InputSlot#}"
    const regex = /{#InputSlot([^#]*?)#}(.*?){\/#InputSlot#}/;
    const match = this.slotString.match(regex);
    
    if (!match) {
      return;
    }
    
    const attributes = match[1];
    this.content = match[2];
    
    // Extract mode
    const modeMatch = attributes.match(/mode="(singleline|textarea)"/);
    if (modeMatch) {
      this.mode = modeMatch[1] as "singleline" | "textarea";
    }
    
    // Extract placeholder
    const placeholderMatch = attributes.match(/placeholder="([^"]*)"/);
    if (placeholderMatch) {
      this.placeholder = placeholderMatch[1];
    }
    
    this.createFragment();
  }

  private createFragment() {
    // Create a document fragment to hold: zero-width space + span + zero-width space
    const fragment = document.createDocumentFragment();
    
    // Before character: zero-width space for cursor positioning
    fragment.appendChild(document.createTextNode("\u200B"));
    
    // Main content: the input slot span
    const span = document.createElement("span");
    span.classList.add("input-slot");
    span.setAttribute("data-placeholder", this.placeholder);
    span.setAttribute("contenteditable", "true");
    span.textContent = this.content;
    
    fragment.appendChild(span);
    
    // After character: zero-width space for cursor positioning
    fragment.appendChild(document.createTextNode("\u200B"));
    
    this.el = fragment;
  }

  toFragment(): DocumentFragment | null {
    return this.el;
  }
}

export class InputSlotLine {
  id: string;
  value: string;
  el: HTMLTemplateElement | null;
  tmpl: HTMLDivElement | null;

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
  ) {
    this.id = crypto.randomUUID();
    this.value = value;
    this.el = null;
    this.tmpl = null;
    this.parseLine();
  }

  private parseLine() {
    // parse this.value
    // 1. extract {#InputSlot..} part
    const inputSlotRegex = /{#InputSlot([^#]*?)#}(.*?){\/#InputSlot#}/g;
    
    // container div for the entire line
    const tmpl = document.createElement("div");
    
    let lastIndex = 0;
    let match;
    
    // 2. for each InputSlot part, create new InputSlot instance
    while ((match = inputSlotRegex.exec(this.value)) !== null) {
      // Add text before the InputSlot
      if (match.index > lastIndex) {
        const textBefore = this.value.substring(lastIndex, match.index);
        tmpl.appendChild(document.createTextNode(textBefore));
      }
      
      // Extract the complete slot string
      const slotString = match[0]; // e.g., "{#InputSlot mode="input"#}你好{/#InputSlot#}"
      
      // 3. create InputSlot instance and get its fragment
      const inputSlot = new InputSlot(slotString);
      const slotFragment = inputSlot.toFragment();
      
      if (slotFragment) {
        tmpl.appendChild(slotFragment);
      }
      
      lastIndex = inputSlotRegex.lastIndex;
    }
    
    // Add remaining text after last InputSlot
    if (lastIndex < this.value.length) {
      const textAfter = this.value.substring(lastIndex);
      tmpl.appendChild(document.createTextNode(textAfter));
    }
    
    this.tmpl = tmpl;
  }

  private parseSlot(attributes: string, content: string): DocumentFragment {
    // Create a document fragment to hold: zero-width space + span + zero-width space
    const fragment = document.createDocumentFragment();
    
    // Extract placeholder from attributes if specified
    let placeholder = "Type here...";
    const placeholderMatch = attributes.match(/placeholder="([^"]*)"/);
    if (placeholderMatch) {
      placeholder = placeholderMatch[1];
    }
    
    // Before character: zero-width space for cursor positioning
    fragment.appendChild(document.createTextNode("\u200B"));
    
    // Main content: the input slot span
    const span = document.createElement("span");
    span.classList.add("input-slot");
    span.setAttribute("data-placeholder", placeholder);
    span.setAttribute("contenteditable", "true");
    span.textContent = content;
    
    fragment.appendChild(span);
    
    // After character: zero-width space for cursor positioning
    fragment.appendChild(document.createTextNode("\u200B"));
    
    return fragment;
  }

  toHTML() {
    console.log("tmpl", this.tmpl?.innerHTML);
    return this.tmpl?.innerHTML;
  }

  toRaw() {}
}
