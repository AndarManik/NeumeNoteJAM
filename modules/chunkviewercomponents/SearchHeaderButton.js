import notes from "../Notes.js";
import noteEditor from "../NoteEditor.js";

class SearchHeaderButton {
  constructor(callbacks) {
    this.callbacks = callbacks;
  }

  buildEditButton(note) {
    const editButton = document.createElement("div");
    editButton.classList.add("searchSectionButton");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", (e) => {
      if (noteEditor.has(note)) {
        return;
      }

      noteEditor.editNote(note);
    });
    return editButton;
  }

  buildRechunkButton(note) {
    const reChunkButton = document.createElement("div");
    reChunkButton.classList.add("searchSectionButton");
    reChunkButton.textContent = "Rechunk";
    reChunkButton.addEventListener("click", async (e) => {
      note.addRechunkAnimation("searchSection");
      await note.chunkText(note.text);
      this.callbacks.handleRechunk(note);
      this.callbacks.setDisplay(note);
    });
    return reChunkButton;
  }

  buildDeleteButton(note) {
    const deleteButton = document.createElement("div");
    deleteButton.classList.add("searchSectionButton");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", (e) => {
      notes.delete(note);
      noteEditor.deleteTab(note);
      this.callbacks.handleDelete(note);
    });
    return deleteButton;
  }

  buildNoteIdentifier(note) {
    const noteIdentifier = document.createElement("div");
    noteIdentifier.classList.add("distanceColorBox");
    noteIdentifier.style.background = note.color;
    noteIdentifier.style.marginLeft = "auto";
    noteIdentifier.style.marginRight = "0.2em";
    return noteIdentifier;
  }

  async rechunk(note) {
    await note.chunkText(note.text);
  }
}

export default SearchHeaderButton;
