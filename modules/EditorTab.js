import notes from "./Notes.js";
class EditorTab {
  constructor(note, handleClick) {
    if (!note) {
      this.note = notes.newBlankNote();
      this.type = "new";
      this.currentText = "";
    } else {
      this.note = note;
      this.type = "old";
      this.currentText = note.text;
    }

    this.isCompleteing = false;
    this.stopComplete = false;
    this.isActive = true;
    this.textBeforeCursor = "";
    this.textAfterCursor = "";
    this.icon = this.buildIcon(handleClick);
  }

  buildIcon(handleClick) {
    const icon = document.createElement("div");
    icon.classList.add("editorTab");
    icon.classList.add("isActiveTab");
    icon.style.background = this.note.getColor();

    icon.addEventListener("click", (e) => {
      handleClick(this);
    });

    document
      .getElementById("rightHeader")
      .insertBefore(
        icon,
        document.getElementById("rightHeader").lastElementChild
      );

    return icon;
  }

  activate() {
    this.isActive = true;
    this.icon.classList.add("isActiveTab");
    document.getElementById("completeSection").value = this.currentText;
    if (this.isCompleteing) {
      this.note.addEditorAnimation("completeSection");
    } else {
      document
        .getElementById("completeSection")
        .classList.remove("editorAnimation");
    }
  }

  deactivate() {
    this.isActive = false;
    this.icon.classList.remove("isActiveTab");
    if (!this.isCompleteing) {
      this.currentText = document.getElementById("completeSection").value;
    }
  }

  getTextWithSmartTag() {
    this.isCompleteing = true;
    this.stopComplete = false;

    this.note.addEditorAnimation("completeSection");

    const { value: text, selectionStart: cursorPosition } =
      document.getElementById("completeSection");
    this.textBeforeCursor = text.substring(0, cursorPosition);
    this.textAfterCursor = text.substring(cursorPosition);

    return `User's Message: "${this.textBeforeCursor}[[SmartComplete]]${this.textAfterCursor}"`;
  }

  async streamTextToNote(textStream) {
    const completeSection = document.getElementById("completeSection");
    for await (const text of textStream) {
      if(this.stopComplete) {
        break;
      }
      this.textBeforeCursor += text;
      this.currentText = this.textBeforeCursor + this.textAfterCursor;
      if (this.isActive) {
        completeSection.value = this.currentText;
      }
    }
    this.isCompleteing = false;
    this.stopComplete = false;

    if (this.isActive) {
      document
        .getElementById("completeSection")
        .classList.remove("editorAnimation");
      document
        .getElementById("completeSection")
        .setSelectionRange(
          this.textBeforeCursor.length,
          this.textBeforeCursor.length
        );
    }
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

  streamFailed() {
    this.isCompleteing = false;
    document
      .getElementById("completeSection")
      .classList.remove("editorAnimation");
  }
}
export default EditorTab;
