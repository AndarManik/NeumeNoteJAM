import ContextBuilder from "./ContextBuilder.js";

class NoteEditor {
  constructor() {
    this.textAfterCursor = "";
    this.textBeforeCursor = "";
    this.isCompleteing = false;
    this.tabs = [];
    this.tabTexts = [];
    this.tabNoteIndexs = [];
    this.currentIndex = -1;
    this.contextBuilder = new ContextBuilder();
  }

  cutText() {
    const completeSection = document.getElementById("completeSection");
    const text = completeSection.value;
    completeSection.value = "";

    if (this.currentIndex == -1) {
      return { text, noteIndex: -1 };
    }

    this.tabs.splice(this.currentIndex, 1);
    this.tabTexts.splice(this.currentIndex, 1);
    const noteIndex = this.tabNoteIndexs[this.currentIndex];
    this.tabNoteIndexs.splice(this.currentIndex, 1);

    this.currentIndex--;

    if (this.currentIndex < 0) {
      if (this.tabs.length) {
        this.currentIndex = 0;
      } else {
        document.getElementById("rightHeader").innerHTML = "";
        return { text, noteIndex };
      }
    }

    this.tabs[this.currentIndex].classList.add("isActiveTab");
    document.getElementById("rightHeader").innerHTML = "";
    document.getElementById("rightHeader").append(...this.tabs);
    completeSection.value = this.tabTexts[this.currentIndex];
    return { text, noteIndex };
  }

  deleteTab(noteIndex){
    if(this.tabNoteIndexs.length && this.tabNoteIndexs[this.currentIndex] == noteIndex){
      this.cutText();
      return;
    }

    const tabIndex = this.tabNoteIndexs.indexOf(noteIndex);
    if(tabIndex == -1){
      return;
    }
    this.tabs.splice(tabIndex, 1)[0].remove();
    this.tabTexts.splice(tabIndex, 1);
    this.tabNoteIndexs.splice(tabIndex, 1);
    
    if(tabIndex < this.currentIndex) {
      this.currentIndex--;
    }
  }

  getTextWithSmartTag() {
    this.setIsCompleting(true);
    const { value: text, selectionStart: cursorPosition } =
      document.getElementById("completeSection");
    this.textBeforeCursor = text.substring(0, cursorPosition);
    this.textAfterCursor = text.substring(cursorPosition);

    const context = this.contextBuilder.getContextPrompt();

    return `${context}\nUser's Message: "${this.textBeforeCursor}[[SmartComplete]]${this.textAfterCursor}"`;
  }

  hasText() {
    const text = document.getElementById("completeSection").value;
    return Boolean(text);
  }

  async streamTextToNote(textStream) {
    const completeSection = document.getElementById("completeSection");
    for await (const text of textStream) {
      this.textBeforeCursor += text;
      completeSection.value = this.textBeforeCursor + this.textAfterCursor;
    }
    this.setIsCompleting(false);
    document
      .getElementById("completeSection")
      .setSelectionRange(
        this.textBeforeCursor.length,
        this.textBeforeCursor.length
      );
  }

  setIsCompleting(value) {
    this.isCompleteing = value;
    document.getElementById("completeSection").classList.toggle("animate");
  }

  editNote(note, noteIndex, uniqueColor) {
    document.getElementById("completeSection").value = note;

    const editorTab = document.createElement("div");
    editorTab.classList.add("editorTab");
    editorTab.classList.add("isActiveTab");
    editorTab.style.background = uniqueColor;

    if (this.currentIndex != -1) {
      this.tabs[this.currentIndex].classList.remove("isActiveTab");
    }

    editorTab.addEventListener("click", (e) => {
      const tabIndex = this.tabNoteIndexs.indexOf(noteIndex);
      if (this.currentIndex != tabIndex) {
        this.tabs[this.currentIndex].classList.remove("isActiveTab");
        this.tabs[tabIndex].classList.add("isActiveTab");

        this.tabTexts[this.currentIndex] =
          document.getElementById("completeSection").value;
        document.getElementById("completeSection").value =
          this.tabTexts[tabIndex];
        this.currentIndex = tabIndex;
      }
    });
    document.getElementById("rightHeader").append(editorTab);

    this.tabs.push(editorTab);
    this.tabNoteIndexs.push(noteIndex);
    this.tabTexts.push(note);
    this.currentIndex = this.tabs.length - 1;
  }

  insertTab() {
    const { value: text, selectionStart: cursorPosition } =
      document.getElementById("completeSection");
    this.textBeforeCursor = text.substring(0, cursorPosition);
    this.textAfterCursor = text.substring(cursorPosition);
    document.getElementById(
      "completeSection"
    ).value = `${this.textBeforeCursor}    ${this.textAfterCursor}`;
    document
      .getElementById("completeSection")
      .setSelectionRange(cursorPosition + 4, cursorPosition + 4);
  }
}
const noteEditor = new NoteEditor();
export default noteEditor;
