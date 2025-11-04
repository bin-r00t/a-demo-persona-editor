import { InputSlot } from "./InputSlot";

export class LLMTemplate {
  constructor(el, templateString) {
    this.el = el;
    this.templateString = templateString;
    // this.supportedRegex = /\u200B<span class="input-slot[^>]*>(.*?)<\/span>/g;
    // this.supportedRegex = /\u200B<span class="input-slot[^>]*data-placeholder="(.*?)"[^>]*>(.*?)<\/span>\u200B/g;
    this.supportedRegex = {
        '#': new RegExp(), // header one
        '##': new RegExp(), // header two
        '###': new RegExp(), // header three
        '**': new RegExp(), // bold
        '*': new RegExp(), // italic
        '~~': new RegExp(), // strikethrough
    }
  }

  parseToModel(markdown) {}

  parseFromModel(model) {}

  getTextForLLM() {
    return this.el.innerText;
  }
}
