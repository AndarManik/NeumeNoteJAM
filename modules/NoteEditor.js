import EditorTab from "./EditorTab.js";
import graphViewer from "./GraphViewer.js";
import setEditorStyle from "./SimpleMDEStyle.js";

class NoteEditor {
  constructor() {
    this.tabs = [];
    this.currentTab = null;
  }

  initialize() {
    this.addMakeNewtabButton();
    this.addBlankTab();
    setEditorStyle();
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
    this.currentTab && this.currentTab.deactivate();

    const blankTab = new EditorTab(null, (tab) => {
      this.setActiveTab(tab);
    });

    this.tabs.push(blankTab);
    this.currentTab = blankTab;
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

    this.currentTab && this.currentTab.deactivate();

    const newTab = new EditorTab(note, (tab) => {
      this.setActiveTab(tab);
    });

    this.tabs.push(newTab);
    this.currentTab = newTab;
  }

  async setActiveTab(tab) {
    if (tab == this.currentTab) {
      return;
    }
    if (this.currentTab) {
      this.currentTab.deactivate();
    }

    this.currentTab = tab;
    tab.activate();
  }

  removeTab(tab) {
    const index = this.tabs.indexOf(tab);
    this.tabs.splice(index, 1)[0].icon.remove();
    if (this.tabs.length == 0) {
      this.addBlankTab();
    } else {
      const newIndex = Math.max(index - 1, 0);
      this.setActiveTab(this.tabs[newIndex]);
    }
  }

  removeNote(note) {
    const index = this.tabs.map(tab => tab.note).indexOf(note);
    this.tabs.splice(index, 1)[0].icon.remove();
    if (this.tabs.length == 0) {
      this.addBlankTab();
    } else {
      const newIndex = Math.max(index - 1, 0);
      this.setActiveTab(this.tabs[newIndex]);
    }
  }

  has(note) {
    return this.tabs.map((tab) => tab.note).indexOf(note);
  }

}

const noteEditor = new NoteEditor();
export default noteEditor;
