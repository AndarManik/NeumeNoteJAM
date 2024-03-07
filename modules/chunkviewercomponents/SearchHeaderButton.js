import notes from "../Notes.js";
import noteEditor from "../NoteEditor.js";
import iconReader from "../IconReader.js";
class SearchHeaderButton {
  constructor(callbacks) {
    this.callbacks = callbacks;
  }

  buildEditButton(note) {
    const editButton = document.createElement("div");
    editButton.classList.add("searchSectionButton");
    editButton.append(iconReader.newIcon("pencil", 22));
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
    reChunkButton.append(iconReader.newIcon("refresh", 22));
    reChunkButton.addEventListener("click", async (e) => {
      note.addRechunkAnimation("searchSection");
      await note.chunkText(note.text);
      await this.callbacks.handleRechunk(note);
      await this.callbacks.setDisplay(note);
    });
    return reChunkButton;
  }

  buildDeleteButton(note) {
    const deleteButton = document.createElement("div");
    deleteButton.classList.add("searchSectionButton");
    deleteButton.append(iconReader.newIcon("trash", 22));
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
