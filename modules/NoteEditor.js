class NoteEditor {
  constructor() {
    this.textAfterCursor = "";
    this.textBeforeCursor = "";
    this.isCompleteing = false;
    this.chunks = [];
    this.embeddings = [];
    this.noteIndex = -1;
  }

  cutText() {
    document.getElementById("searchSection").classList.toggle("animate");

    const completeSection = document.getElementById("completeSection");
    const text = completeSection.value;
    completeSection.value = "";

    const chunks = this.chunks;
    this.chunks = [];

    const embeddings = this.embeddings;
    this.embeddings = []

    const noteIndex = this.noteIndex;
    this.noteIndex = -1;

    return {text, chunks, embeddings, noteIndex};
  }

  getTextWithSmartTag() {
    this.isCompleteing = true;
    document.getElementById("completeSection").classList.toggle("animate");
    const { value: text, selectionStart: cursorPosition } =
      document.getElementById("completeSection");
    this.textBeforeCursor = text.substring(0, cursorPosition);
    this.textAfterCursor = text.substring(cursorPosition);
    return `${this.textBeforeCursor}[[Smart Complete]]${this.textAfterCursor}`;
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
    this.isCompleteing = false;
    document.getElementById("completeSection").classList.toggle("animate");
  }

  editNote(note, chunks, embeddings, noteIndex) {
    document.getElementById("completeSection").value = note;
    this.chunks = chunks;
    this.embeddings = embeddings;
    this.noteIndex = noteIndex;
  }
}
const noteEditor = new NoteEditor();
export default noteEditor;
