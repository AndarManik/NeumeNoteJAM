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
    this.stopComplete = false;
    this.isActive = true;
    this.streamPaused = false;
    this.textBeforeCursor = "";
    this.textAfterCursor = "";

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
    this.editorDiv.placeholder =
      "New note";

    this.containerDiv.append(this.editorDiv);

    this.activate();

    const toolbar = [
      "bold",
      "italic",
      "heading",
      "|",
      "quote",
      "unordered-list",
      "ordered-list",
      "|",
      "code",
      "link",
      "image",
      "|",
      "preview",
      "side-by-side",
      "fullscreen",
      "|",
      {
        name: "smartComplete",
        action: this.complete.bind(this),
        className: "fa-solid fa-wand-magic-sparkles", // Using Font Awesome icon here
        title: "Smart complete (Shift-Enter)",
      },
      {
        name: "save",
        action: this.save.bind(this),
        className: "fa-solid fa-floppy-disk", // Using Font Awesome icon here
        title: "Save note (Shift-S)",
        disableInPreview: false
      },
      {
        name: "close",
        action: this.close.bind(this),
        className: "fa-solid fa-x", // Using Font Awesome icon here
        title: "Discard changes",
        disableInPreview: false
      },
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

    document.querySelectorAll('.editor-toolbar > .fa-floppy-disk, .fa-x').forEach(button => {
      button.classList.add("no-disable"); // This line might vary based on how the buttons are implemented
    });

    this.simplemde.codemirror.setValue(this.currentText);

    if(this.type == "old"){
      this.simplemde.togglePreview();
    }

    this.simplemde.codemirror
      .getInputField()
      .addEventListener("keydown", (event) => {
        if (event.ctrlKey && event.keyCode == 83) {
          event.preventDefault();
          this.save(this.simplemde);
        }
        if (event.shiftKey && event.key === 'Enter') {
          event.preventDefault();
          this.complete(this.simplemde);
        }
      });
  }

  activate() {
    this.isActive = true;
    this.icon.classList.add("isActiveTab");
    document.getElementById("rightSectionBody").append(this.containerDiv);
  }

  deactivate() {
    this.isActive = false;
    this.icon.classList.remove("isActiveTab");
    document.getElementById("rightSectionBody").innerHTML = "";
  }

  async complete(editor) {
    this.note.addEditorAnimation(this.containerDiv.children[2]);
    //this.note.addEditorAnimation(this.containerDiv.children[1]);

    const cm = editor.codemirror;
    const docContent = cm.getValue();
    const cursorPosition = cm.getCursor();
    const index = cm.indexFromPos(cursorPosition);
    const smartTaged =
      docContent.slice(0, index) +
      "[[SmartComplete]]" +
      docContent.slice(index);
    const stream = await openAI.smartComplete(smartTaged, contextBuilder.getContextPrompt());

    var startPoint = cm.getCursor("start");

    for await (let text of stream) {
      cm.setCursor(startPoint);
      cm.replaceRange(text, startPoint);
      startPoint = cm.getCursor("end"); // Update startPoint to the end of the inserted text
    }

    this.containerDiv.children[2].classList.remove("editorAnimation");
    //this.containerDiv.children[1].classList.remove("editorAnimation");
  }
  
  async save(editor) {
    const cm = editor.codemirror;
    const text = cm.getValue();

    if(!text) {
      return;
    }

    this.note.addRechunkAnimation("searchSection");


    this.deactivate();
    noteEditor.removeTab(this);

    if (this.type == "new") {
      await this.note.chunkText(text);
      await notes.finishedAdding();
      notes.addNote(this.note);

    } else {
      await this.note.reChunkText(text);
      await notes.finishedAdding();
      notes.updateNote(this.note);
    }
  }

  close(){
    noteEditor.removeTab(this);
  }
}
export default EditorTab;
