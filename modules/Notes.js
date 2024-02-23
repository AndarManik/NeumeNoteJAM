import ChunkViewer from "./ChunkViewer.js";
class Notes {
  constructor() {
    this.notes = [];
    this.chunks = [];
    this.embeddings = [];
    this.chunk2note = [];
    this.note2chunk = [];
    this.isSearching = false;
    this.chunkViewer = new ChunkViewer(this);
  }

  linkEditor(noteEditor) {
    this.editor = noteEditor;
  }

  setData(data) {
    console.log(data);
    if (!data) {
      return;
    }
    this.notes = data.notes;
    this.chunks = data.chunks;
    this.embeddings = data.embeddings;
    this.chunk2note = data.chunk2note;
    this.note2chunk = data.note2chunk;
  }

  pushNote(note,texts, embeddings) {
    document.getElementById("searchSection").classList.toggle("animate");

    const searchSection = document.getElementById("searchSection");
    searchSection.innerHTML = "";

    this.notes.push(note);
    this.note2chunk.push([texts.length, this.chunks.length]);
    this.chunks.push(...texts);
    this.embeddings.push(...embeddings);
    texts.forEach(() => {this.chunk2note.push(this.notes.length - 1)});
    this.chunkViewer.displayNotes(this.notes.length - 1)
  }

  rePushNote(note, texts, embeddings, noteIndex) {
    document.getElementById("searchSection").classList.toggle("animate");

    const searchSection = document.getElementById("searchSection");
    searchSection.innerHTML = "";

    const chunkPositions = this.note2chunk[noteIndex];
    const start = chunkPositions[1]
    const end = chunkPositions[0];

    this.notes[noteIndex] = note;
    this.note2chunk[noteIndex][0] = texts.length;
    this.chunks.splice(start, end,...texts);
    this.embeddings.splice(start, end,...embeddings);
    const chunk2note = []
    texts.forEach(() => {chunk2note.push(noteIndex)});
    this.chunk2note.splice(start, end, ...chunk2note);

    const lengthDiff = texts.length - end;
    for(let i = noteIndex + 1; i < this.notes.length; i++){
      this.note2chunk[i][1] += lengthDiff;
    }
    this.chunkViewer.displayNotes(noteIndex)
  }

  getSearchText() {
    this.isSearching = true;
    document.getElementById("searchSection").classList.toggle("animate");
    const searchText = document.getElementById("searchInputSection").value;
    document.getElementById("searchInputSection").value = "";
    document.getElementById("searchSection").innerHTML = "";
    return searchText;
  }

  search(embedding) {
    const searchSection = document.getElementById("searchSection");
    searchSection.innerHTML = "";
    const nearest = this.nearestNeighbor(embedding, 6);
    this.chunkViewer.displayNNSearch(nearest);
    this.isSearching = false;
    document.getElementById("searchSection").classList.remove("animate");

  }

  nearestNeighbor(embedding, N) {
    const distances = this.embeddings.map((e, i) => {
      let sum = 0;
      for (let j = 0; j < embedding.length; j++) {
        sum += (e[j] - embedding[j]) ** 2;
      }
      return { index: i, distance: sum };
    });

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, N);
  }
}

const notes = new Notes();
export default notes;
