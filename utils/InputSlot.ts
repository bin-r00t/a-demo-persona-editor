export class InputSlot {
  id: string;
  value: string;
  mode: "singleline" | "textarea";
  placeholder: string;

  constructor(
    id: string,
    value: string,
    mode: "singleline" | "textarea",
    placeholder: string = "Type here...",
  ) {
    this.id = id;
    this.value = value;
    this.mode = mode;
    this.placeholder = placeholder;
  }

  toHTML() {
    return `&#8203;<span class="input-slot ${
      this.mode === "textarea" ? "multiline" : ""
    }" data-placeholder="${this.placeholder}" contenteditable="true">${
      this.value
    }</span>&#8203;`;
  }

  toRaw() {}
}
