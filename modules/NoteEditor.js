import EditorTab from "./EditorTab.js";
import openAI from "./OpenAI.js";
import notes from "./Notes.js";
import graphViewer from "./GraphViewer.js";
import contextBuilder from "./ContextBuilder.js";

class NoteEditor {
  constructor() {
    this.tabs = [];
    this.currentTab = null;
  }

  initialize() {
    this.addMakeNewtabButton();
    this.addBlankTab();
    document
      .getElementById("completeSection")
      .addEventListener("keydown", async (e) => {
        if(!openAI.validKey) {
          return;
        }
        const shiftEnterPressed = e.shiftKey && e.code == "Enter";
        if (shiftEnterPressed && this.canComplete()) {
          e.preventDefault();
          await this.complete();
        }
        if (e.code === "Escape") {
          e.preventDefault();
          this.stopComplete();
        }
        if (e.ctrlKey && e.code === "KeyS") {
          e.preventDefault();
          if (this.hasText()) {
            await this.save();
          }
        }
        if (e.code === "Tab" && this.canComplete()) {
          e.preventDefault();
          this.insertTab();
        }
      });
  }

  async complete() {
    const textWithSmartTag = this.getTextWithSmartTag();
    const textStream = await openAI.smartComplete(textWithSmartTag);
    if (!textStream) {
      noteEditor.streamFailed();
      return;
    }
    this.streamTextToTab(textStream);
  }

  async save() {
    const { note, type } = await this.saveText();
    await notes.finishedAdding();
    if (type == "new") {
      notes.addNote(note);
    } else {
      notes.updateNote(note);
    }
  }

  addMakeNewtabButton() {
    const newTabButton = document.createElement("div");
    newTabButton.classList.add("makeNewTabButton");
    newTabButton.addEventListener("click", (e) => {
      this.addBlankTab();
    });
    document.getElementById("rightHeader").append(newTabButton);
  }

  addBlankTab() {
    const blankTab = new EditorTab(null, (tab) => {
      this.setActiveTab(tab);
    });

    this.tabs.push(blankTab);
    this.setActiveTab(blankTab);
  }

  editNote(note) {
    if (graphViewer.state == "graph") {
      graphViewer.displayEditor();
    }

    const noteIndex = this.has(note);

    if (noteIndex != -1) {
      this.setActiveTab(this.tabs[noteIndex]);
      return;
    }

    const newTab = new EditorTab(note, (tab) => {
      this.setActiveTab(tab);
    });

    this.tabs.push(newTab);
    this.setActiveTab(newTab);
  }

  //TODO: this was recently made to be async but other things weren't
  // so I didn't change them. They didn't need to await it technically 
  // but there might be a time in the future where I might need to color all the functions
  // I just don't want to do that right now.
  async setActiveTab(tab) {
    if (tab == this.currentTab) {
      return;
    }
    if (this.currentTab) {
      this.currentTab.deactivate();
      if(this.currentTab.isCompleteing){
        while(!this.currentTab.streamPaused) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }
    }

    this.currentTab = tab;
    tab.activate();
  }

  async saveText() {
    const completeSection = document.getElementById("completeSection");
    const text = completeSection.value;
    const note = this.currentTab.note;
    const type = this.currentTab.type;
    const index = this.tabs.indexOf(this.currentTab);

    note.addRechunkAnimation("searchSection");

    completeSection.value = "";
    this.tabs.splice(index, 1)[0].icon.remove();

    if (this.tabs.length == 0) {
      console.log("saveText addBlankTab");
      this.addBlankTab();
    } else {
      console.log("saveText setActiveTab");

      const newIndex = Math.max(index - 1, 0);
      this.setActiveTab(this.tabs[newIndex]);
    }

    if (type == "new") {
      await note.chunkText(text);
    } else {
      await note.reChunkText(text);
    }

    return { note, type };
  }

  deleteTab(note) {
    if (this.tabs.length && this.currentTab.note == note) {
      this.saveText();
      return;
    }

    const tabIndex = this.tabs.map((tab) => tab.note).indexOf(note);
    if (tabIndex == -1) {
      return;
    }

    this.tabs.splice(tabIndex, 1)[0].icon.remove();
  }

  canComplete() {
    return (
      !this.currentTab.isCompleteing &&
      document.activeElement == document.getElementById("completeSection")
    );
  }

  getTextWithSmartTag() {
    const smartTag = this.currentTab.getTextWithSmartTag();
    const context = contextBuilder.getContextPrompt();
    return `${context}\n${smartTag}"`;
  }

  hasText() {
    const text = document.getElementById("completeSection").value;
    return Boolean(text);
  }

  streamTextToTab(textStream) {
    this.currentTab.streamTextToNote(textStream);
  }

  streamFailed() {
    this.currentTab.streamFailed();
  }

  has(note) {
    return this.tabs.map((tab) => tab.note).indexOf(note);
  }

  stopComplete() {
    this.currentTab.stopComplete = true;
  }

  insertTab() {
    console.log("insert tab");
    this.currentTab.insertTab();
  }
}

const noteEditor = new NoteEditor();
export default noteEditor;
