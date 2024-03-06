import instances from "./NeumeEngine.js";
import Note from "./Note.js";
class Notes {
  constructor() {
    this.colorCounter = 0;
    this.notes = [];
    this.isSearching = false;
  }

  async initialize() {
    const data = await instances.notesDatabase.getNotes();
    
    if (!data) {
      return;
    }
    
    this.colorCounter = data.colorCounter;
    this.notes = data.notes.map(noteData => {
      return new Note(noteData.colorCounter, noteData.text, noteData.chunks, noteData.embeddings);
    });
  }

  newBlankNote() {
    this.colorCounter++;
    console.log("colorCounter",this.colorCounter);
    return new Note(this.colorCounter);
  }

  addNote(note){
    this.notes.push(note);
    document.getElementById("searchSection").classList.remove('rechunkAnimation');
    instances.chunkViewer.handleRechunk(note);
    instances.chunkViewer.displayNotes(note);
  }

  updateNote(note){
    document.getElementById("searchSection").classList.remove('rechunkAnimation');
    instances.chunkViewer.handleRechunk(note);
    if(!instances.chunkViewer.isCurrentHistory(note)){
      instances.chunkViewer.displayNotes(note);
    }
    else {
      instances.chunkViewer.setNoteSearchSection(note);
    }
  }

  delete(note) {
    const noteIndex = this.notes.findIndex((n) => n === note);
    if (noteIndex !== -1) {
      this.notes.splice(noteIndex, 1);
    }
  }

  canSearch(){
    return !this.isSearching && document.activeElement ==  document.getElementById("searchInputSection");
  }

  getSearchText() {
    document.getElementById("searchSection").classList.add("animate");
    const searchText = document.getElementById("searchInputSection").value;
    document.getElementById("searchInputSection").value = "";
    return searchText;
  }

  search(embedding) {
    this.notes.isSearching = true;
    document.getElementById("searchSection").classList.add("animate");
    const nearest = this.nearestNeighbor(embedding, 10);
    this.isSearching = false;
    document.getElementById("searchSection").classList.remove("animate");
    instances.chunkViewer.displayNearestSearch(nearest);
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
    console.log("distances",distances);
    distances.sort((a, b) => a.distance - b.distance);
    return { embedding, data: distances.slice(0, N) };
  }

  deleteData() {
    this.notes = [];
    this.colorCounter = 0;
  }

  async finishedProcessing(){
    while (this.notes.some(note => note.isProcessing)) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Check every 100ms
    }
    return;
  }
}

const notes = new Notes();
instances.notes = notes;
export default notes;
