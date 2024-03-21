import notes from "../Notes.js";
import noteEditor from "../NoteEditor.js";
import iconReader from "../IconReader.js";
import chunkViewer from "../ChunkViewer.js";
import graphViewer from "../GraphViewer.js";

class SearchHeaderButton {
  constructor() {
    this.iconSize = 16;
  }

  buildLeft() {
    const leftArrow = document.createElement("div");
    leftArrow.classList.add("searchSectionButton");
    leftArrow.append(iconReader.newIcon("chevronLeft", this.iconSize));
    leftArrow.addEventListener("click", (e) => {
      chunkViewer.goBack();
    });
    leftArrow.setAttribute("title", "Go back");

    return leftArrow;
  }

  buildRight() {
    const rightArrow = document.createElement("div");
    rightArrow.classList.add("searchSectionButton");
    rightArrow.append(iconReader.newIcon("chevronRight", this.iconSize));
    rightArrow.addEventListener("click", (e) => {
      chunkViewer.goForward();
    });
    rightArrow.setAttribute("title", "Go forward");
    return rightArrow;
  }

  buildEditButton(note) {
    const editButton = document.createElement("div");
    editButton.classList.add("searchSectionButton");
    editButton.append(iconReader.newIcon("pencil", this.iconSize));
    editButton.addEventListener("click", (e) => {
      noteEditor.editNote(note);
    });
    editButton.setAttribute("title", "Edit note");

    return editButton;
  }

  buildRechunkButton(note) {
    const reChunkButton = document.createElement("div");
    reChunkButton.classList.add("searchSectionButton");
    reChunkButton.append(iconReader.newIcon("refresh", this.iconSize));
    reChunkButton.addEventListener("click", async (e) => {
      note.addRechunkAnimation("searchSection");
      await note.chunkText(note.text);
      chunkViewer.handleRechunk(note);
      chunkViewer.setNoteSearchSection(note);
      graphViewer.handleNoteChange();
    });
    reChunkButton.setAttribute("title", "Rechunk note");

    return reChunkButton;
  }

  buildDeleteButton(note) {
    const deleteButton = document.createElement("div");
    deleteButton.classList.add("searchSectionButton");
    deleteButton.append(iconReader.newIcon("trash", this.iconSize));
    deleteButton.addEventListener("click", (e) => {
      notes.delete(note);
      noteEditor.deleteTab(note);
      chunkViewer.handleDelete(note);
      graphViewer.handleNoteChange();
    });
    deleteButton.setAttribute("title", "Delete note");
    return deleteButton;
  }

  buildNoteIdentifier(note) {
    const noteIdentifier = document.createElement("div");
    noteIdentifier.classList.add("distanceColorBox");
    noteIdentifier.style.background = note.getColor();
    noteIdentifier.style.marginLeft = "auto";
    noteIdentifier.style.marginRight = "0.2em";
    return noteIdentifier;
  }

  async rechunk(note) {
    await note.chunkText(note.text);
  }
}

export default SearchHeaderButton;
