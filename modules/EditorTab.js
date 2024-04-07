import notes from "./Notes.js";
import noteEditor from "./NoteEditor.js";
import openAI from "./OpenAI.js";
import contextBuilder from "./ContextBuilder.js";

class EditorTab {
  constructor(note) {
    if (note) {
      this.note = note;
      this.type = "old";
      this.currentText = note.text;
    } else {
      this.note = notes.newBlankNote();
      this.type = "new";
      this.currentText = "";
    }

    this.isCompleteing = false;
    this.completeCanceled = false;

    this.buildIcon();
    this.buildEditor();
  }

  buildIcon() {
    this.icon = document.createElement("div");
    this.icon.classList.add("editorTab");
    this.icon.classList.add("isActiveTab");
    this.icon.style.background = this.note.getColor();

    this.icon.addEventListener("click", (e) => {
      noteEditor.setActiveTab(this);
    });

    document
      .getElementById("rightHeader")
      .insertBefore(
        this.icon,
        document.getElementById("rightHeader").lastElementChild
      );
  }

  buildEditor() {
    this.containerDiv = document.createElement("div");
    this.containerDiv.classList.add("editorContainer");
    this.editorDiv = document.createElement("textarea");
    this.editorDiv.id = "completeSection";
    this.editorDiv.placeholder = "New note";

    this.containerDiv.append(this.editorDiv);

    this.activate();

    const toolbar = [
      {
        name: "smartComplete",
        action: this.complete.bind(this),
        className: "fa-solid fa-wand-magic-sparkles",
        title: "Smart complete (Shift-Enter)",
      },
      {
        name: "save",
        action: this.save.bind(this),
        className: "fa-solid fa-floppy-disk",
        title: "Save note (Shift-S)",
        disableInPreview: false,
      },
      {
        name: "close",
        action: this.close.bind(this),
        className: "fa-solid fa-x",
        title: "Discard changes",
        disableInPreview: false,
      },
      "|",
      "preview",
      "side-by-side",
      "fullscreen",
      "|",
      "guide",
    ];

    this.simplemde = new SimpleMDE({
      toolbar,
      element: this.editorDiv,
      styleSelectedText: false,
      tabSize: 4,
      spellChecker: false,
      renderingConfig: {
        codeSyntaxHighlighting: true,
      },
    });

    document
      .querySelectorAll(".editor-toolbar > .fa-floppy-disk, .fa-x")
      .forEach((button) => {
        button.classList.add("no-disable"); // This line might vary based on how the buttons are implemented
      });

    this.simplemde.codemirror.setValue(this.currentText);

    if (this.type == "old") {
      this.simplemde.togglePreview();
    }

    this.simplemde.codemirror
      .getInputField()
      .addEventListener("keydown", (event) => {
        if (event.ctrlKey && event.keyCode == 83) {
          event.preventDefault();
          this.save(this.simplemde);
        }
        if (event.shiftKey && event.key === "Enter") {
          event.preventDefault();
          this.complete(this.simplemde);
        }
        if (event.key === "Escape") {
          event.preventDefault();
          this.completeCanceled = true;
        }
      });
  }

  activate() {
    this.icon.classList.add("isActiveTab");
    document.getElementById("rightSectionBody").append(this.containerDiv);
  }

  deactivate() {
    this.icon.classList.remove("isActiveTab");
    document.getElementById("rightSectionBody").innerHTML = "";
  }

  async complete(editor) {
    if (this.isCompleteing) {
      this.completeCanceled = true;
      return;
    }

    const wandIcon = document.querySelectorAll(
      ".editor-toolbar > .fa-wand-magic-sparkles"
    )[0];

    wandIcon.classList.remove("fa-wand-magic-sparkles");
    wandIcon.classList.add("fa-hand");

    this.note.addEditorAnimation(this.containerDiv.children[2]);
    this.isCompleteing = true;
    this.completeCanceled = false;
    const cm = editor.codemirror;
    const docContent = cm.getValue();
    const fromCursor = cm.getCursor("from");
    const toCursor = cm.getCursor("to");
    const fromIndex = cm.indexFromPos(fromCursor);
    const toIndex = cm.indexFromPos(toCursor);
    var selection = cm.getSelection();

    const smartTaged =
      fromIndex == toIndex
        ? docContent.slice(0, fromIndex) +
          "[[SmartComplete]]" +
          docContent.slice(fromIndex)
        : docContent.slice(0, fromIndex) +
          "[[SmartReplaceStart]]" +
          docContent.slice(fromIndex, toIndex) +
          "[[SmartReplaceEnd]]" +
          docContent.slice(toIndex);

    try {
      const stream =
        fromIndex == toIndex
          ? await openAI.smartComplete(
              smartTaged,
              contextBuilder.getContextPrompt()
            )
          : await openAI.smartReplace(
              smartTaged,
              contextBuilder.getContextPrompt()
            );

      var newText = "";
      var isReplace = true;
      var startPoint = toCursor;
      for await (let text of stream) {
        newText += text;

        if (isReplace) {
          //The current generated text is shorter than the selection
          if (text.length > selection.length) {
            isReplace = false;
            cm.setCursor(fromCursor);
            cm.replaceRange(newText, fromCursor, startPoint);
          } else {
            selection = selection.slice(text.length);
            cm.setCursor(fromCursor);
            cm.replaceRange(newText + selection, fromCursor, startPoint);
          }
        } else {
          //The current generated text is longer than the selection
          cm.setCursor(startPoint);
          cm.replaceRange(text, startPoint);
        }

        startPoint = cm.getCursor("end"); // Update startPoint to the end of the inserted text

        if (this.completeCanceled) {
          this.containerDiv.children[2].classList.remove("editorAnimation");
          this.isCompleteing = false;
          wandIcon.classList.remove("fa-hand");
          wandIcon.classList.add("fa-wand-magic-sparkles");
          return;
        }
      }

      if (isReplace) {
        cm.replaceRange(newText, fromCursor, startPoint);
      }
      this.containerDiv.children[2].classList.remove("editorAnimation");
      this.isCompleteing = false;
      wandIcon.classList.remove("fa-hand");
      wandIcon.classList.add("fa-wand-magic-sparkles");
    } catch (e) {
      this.containerDiv.children[2].classList.remove("editorAnimation");
      this.isCompleteing = false;
      wandIcon.classList.remove("fa-hand");
      wandIcon.classList.add("fa-wand-magic-sparkles");
      throw e;
    }
  }

  async save(editor) {
    const cm = editor.codemirror;
    const text = cm.getValue();

    if (!text) {
      return;
    }

    this.note.addRechunkAnimation("searchSection");

    this.deactivate();
    noteEditor.removeTab(this);

    if (this.type == "new") {
      await this.note.chunkText(text);
      await notes.finishedAdding();
      await notes.addNote(this.note);
    } else {
      await this.note.reChunkText(text);
      await notes.finishedAdding();
      await notes.updateNote(this.note);
    }
  }

  close() {
    noteEditor.removeTab(this);
  }
}
export default EditorTab;
