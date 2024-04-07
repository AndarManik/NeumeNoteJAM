import Note from "./Note.js";
import openAI from "./OpenAI.js";
import notesDatabase from "./NotesDatabase.js";
import chunkViewer from "./ChunkViewer.js";
import graphViewer from "./GraphViewer.js";
class Notes {
  constructor() {
    this.colorCounter = 0;
    this.notes = [];
    this.isSearching = false;
    this.isAdding = false;
  }

  async initialize() {
    const notesData = await notesDatabase.getNotes();
    console.log(notesData);
    if (!notesData) {
      return;
    }
    if (notesData[0] && notesData[0].data && notesData[0].data.notes) {
      this.notes = notesData[0].data.notes.map((noteData) => {
        return new Note(
          noteData.data.colorCounter,
          noteData.data.text,
          noteData.data.chunks,
          noteData.data.embeddings,
          noteData.data.title
        );
      });
      await notesDatabase.saveNotes(this.notes);
    } else {
      this.notes = notesData.map((noteData) => {
        return new Note(
          noteData.data.colorCounter,
          noteData.data.text,
          noteData.data.chunks,
          noteData.data.embeddings,
          noteData.data.title
        );
      });
    }

    this.colorCounter = Math.max(
      0,
      ...this.notes.map((note) => note.colorCounter)
    );

    document
      .getElementById("searchInputSection")
      .addEventListener("keydown", async (e) => {
        const shiftEnterPressed = e.shiftKey && e.code == "Enter";
        if (shiftEnterPressed && this.canSearch()) {
          e.preventDefault();
          await this.search();
        }
      });
  }

  async search() {
    this.notes.isSearching = true;
    document.getElementById("searchSection").classList.add("animate");
    const searchText = this.getSearchText();
    const embedding = await openAI.embed(searchText);
    const nearest = this.nearestNeighbor(embedding, 10);
    document.getElementById("searchSection").classList.remove("animate");
    chunkViewer.displayNearestSearch(nearest);
    this.isSearching = false;
  }

  searchEmbedding(embedding) {
    this.notes.isSearching = true;
    document.getElementById("searchSection").classList.add("animate");
    const nearest = this.nearestNeighbor(embedding, 10);
    document.getElementById("searchSection").classList.remove("animate");
    chunkViewer.displayNearestSearch(nearest);
    this.isSearching = false;
  }

  loadNewData(data) {
    this.colorCounter = 0;
    this.notes = data.map((noteData) => {
      if (this.colorCounter < noteData.colorCounter) {
        this.colorCounter = noteData.colorCounter;
      }
      return new Note(
        noteData.colorCounter,
        noteData.text,
        noteData.chunks,
        noteData.embeddings,
        noteData.title
      );
    });
  }

  newBlankNote() {
    this.colorCounter++;
    console.log("colorCounter", this.colorCounter);
    return new Note(this.colorCounter);
  }

  async addNote(note) {
    this.isAdding = true;
    this.notes.push(note);

    chunkViewer.handleRechunk(note);
    const databasePromise = notesDatabase.saveNote(note);
    graphViewer.handleNoteChange();
    await databasePromise;
    chunkViewer.displayNotes(note);
    document
      .getElementById("searchSection")
      .classList.remove("rechunkAnimation");
    this.isAdding = false;
  }

  async updateNote(note) {
    this.isAdding = true;

    chunkViewer.handleRechunk(note);
    const databasePromise = notesDatabase.saveNote(note);

    graphViewer.handleNoteChange();
    await databasePromise;

    if (!chunkViewer.isCurrentHistory(note)) {
      chunkViewer.displayNotes(note);
    } else {
      chunkViewer.setNoteSearchSection(note);
    }

    document
      .getElementById("searchSection")
      .classList.remove("rechunkAnimation");
    this.isAdding = false;
  }

  delete(note) {
    const noteIndex = this.notes.findIndex((n) => n === note);
    notesDatabase.deleteNote(note.colorCounter);
    if (noteIndex !== -1) {
      this.notes.splice(noteIndex, 1);
    }
  }

  canSearch() {
    return (
      !this.isSearching &&
      document.activeElement == document.getElementById("searchInputSection")
    );
  }

  getSearchText() {
    document.getElementById("searchSection").classList.add("animate");
    const searchText = document.getElementById("searchInputSection").value;
    document.getElementById("searchInputSection").value = "";
    return searchText;
  }

  nearestNeighbor(embedding, N) {
    const distances = this.notes
      .map((note) => {
        return note.embeddings.map((e, index) => {
          let distance = 0;
          for (let j = 0; j < embedding.length; j++) {
            distance += (e[j] - embedding[j]) ** 2;
          }
          return { note, index, distance };
        });
      })
      .flat();
    console.log("distances", distances);
    distances.sort((a, b) => a.distance - b.distance);
    return { embedding, data: distances.slice(0, N) };
  }

  deleteData() {
    this.notes = [];
    this.colorCounter = 0;
  }

  async finishedProcessing() {
    while (this.notes.some((note) => note.isProcessing)) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Check every 100ms
    }
    return;
  }

  async finishedAdding() {
    while (this.isAdding) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Check every 100ms
    }
    return;
  }
}

const notes = new Notes();
export default notes;
