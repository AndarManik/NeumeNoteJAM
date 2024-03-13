import EditorTab from "./EditorTab.js";
import instances from "./NeumeEngine.js";

class NoteEditor {
  constructor() {
    this.tabs = [];
    this.currentTab = null;
  }

  initialize(){
    this.addMakeNewtabButton();
    this.addBlankTab();
  }

  addMakeNewtabButton() {
    const newTabButton = document.createElement("div");
    newTabButton.classList.add("makeNewTabButton");
    newTabButton.addEventListener("click", e => {
      this.addBlankTab();
    })
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
    if(instances.graphViewer.state == "graph") {
      instances.graphViewer.displayEditor();
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

  setActiveTab(tab) {
    if (tab == this.currentTab) {
      return;
    }
    if (this.currentTab) {
      this.currentTab.deactivate();
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

    if(this.tabs.length == 0){
      console.log("saveText addBlankTab");
      this.addBlankTab();
    }
    else {
      console.log("saveText setActiveTab");

      const newIndex = Math.max(index - 1, 0);
      this.setActiveTab(this.tabs[newIndex]);
    }

    if (type == "new") {
      await note.chunkText(text);
    } else {
      await note.reChunkText(text);
    }

    return {note, type};
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
    return !this.currentTab.isCompleteing && document.activeElement ==  document.getElementById("completeSection");
  }

  getTextWithSmartTag() {
    const smartTag = this.currentTab.getTextWithSmartTag();
    const context = instances.contextBuilder.getContextPrompt();
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

  stopComplete(){
    this.currentTab.stopComplete = true;
  }

  insertTab(){
    console.log("insert tab");
    this.currentTab.insertTab();
  }
}

const noteEditor = new NoteEditor();
instances.noteEditor = noteEditor;
export default noteEditor;
