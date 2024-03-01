import ChunkViewer from "./ChunkViewer.js";
import { splitEmbed, reSplitEmbed } from "./NoteChunker.js";

class Notes {
  constructor() {
    this.notes = [];
    this.chunks = [];
    this.embeddings = [];
    this.chunk2note = [];
    this.note2chunk = [];
    this.isSearching = false;
    this.chunkViewer = new ChunkViewer();
  }

  delete(noteIndex) {
    const numDeleted = this.note2chunk[noteIndex][0];
    this.notes.splice(noteIndex, 1);
    this.chunks.splice(
      this.note2chunk[noteIndex][1],
      this.note2chunk[noteIndex][0]
    );
    this.embeddings.splice(
      this.note2chunk[noteIndex][1],
      this.note2chunk[noteIndex][0]
    );
    this.chunk2note.splice(
      this.note2chunk[noteIndex][1],
      this.note2chunk[noteIndex][0]
    );
    this.note2chunk.splice(noteIndex, 1);

    for (let i = 0; i < this.chunk2note.length; i++) {
      this.chunk2note[i] =
        this.chunk2note[i] > noteIndex
          ? this.chunk2note[i] - 1
          : this.chunk2note[i];
    }

    for (let i = noteIndex; i < this.note2chunk.length; i++) {
      this.note2chunk[i][1] -= numDeleted;
    }
  }

  getNoteData(noteIndex) {
    return {
      note: this.notes[noteIndex],
      chunks: this.chunks.slice(
        this.note2chunk[noteIndex][1],
        this.note2chunk[noteIndex][0] + this.note2chunk[noteIndex][1]
      ),
      embeddings: this.embeddings.slice(
        this.note2chunk[noteIndex][1],
        this.note2chunk[noteIndex][0] + this.note2chunk[noteIndex][1]
      ),
    };
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

  async pushNote(note) {
    document.getElementById("searchSection").classList.add("animate");
    const { texts, embeddings } = await splitEmbed(note);
    this.notes.push(note);
    this.note2chunk.push([texts.length, this.chunks.length]);
    this.chunks.push(...texts);
    this.embeddings.push(...embeddings);
    texts.forEach(() => {
      this.chunk2note.push(this.notes.length - 1);
    });
    document.getElementById("searchSection").classList.remove("animate");
    this.chunkViewer.displayNotes(this.notes.length - 1);
  }

  async rePushNote(note, noteIndex) {
    document.getElementById("searchSection").classList.add("animate");
    const data = this.getNoteData(noteIndex);
    console.log("rePushNote after getNoteData:", noteIndex, data);
    const { texts, embeddings } = await reSplitEmbed(
      note,
      data.chunks,
      data.embeddings
    );

    const chunkPositions = this.note2chunk[noteIndex];
    const start = chunkPositions[1];
    const end = chunkPositions[0];

    this.notes[noteIndex] = note;
    this.note2chunk[noteIndex][0] = texts.length;
    this.chunks.splice(start, end, ...texts);
    this.embeddings.splice(start, end, ...embeddings);
    const chunk2note = [];
    texts.forEach(() => {
      chunk2note.push(noteIndex);
    });
    this.chunk2note.splice(start, end, ...chunk2note);

    const lengthDiff = texts.length - end;
    for (let i = noteIndex + 1; i < this.notes.length; i++) {
      this.note2chunk[i][1] += lengthDiff;
    }

    this.chunkViewer.displayNotes(noteIndex) 
    document.getElementById("searchSection").classList.remove("animate");
  }

  async reChunk(noteIndex) {
    document.getElementById("searchSection").classList.add("animate");

    const { texts, embeddings } = await splitEmbed(this.notes[noteIndex]);
    const chunkPositions = this.note2chunk[noteIndex];
    const start = chunkPositions[1];
    const end = chunkPositions[0];

    this.note2chunk[noteIndex][0] = texts.length;
    this.chunks.splice(start, end, ...texts);
    this.embeddings.splice(start, end, ...embeddings);
    const chunk2note = [];
    texts.forEach(() => {
      chunk2note.push(noteIndex);
    });
    this.chunk2note.splice(start, end, ...chunk2note);

    const lengthDiff = texts.length - end;
    for (let i = noteIndex + 1; i < this.notes.length; i++) {
      this.note2chunk[i][1] += lengthDiff;
    }
    document.getElementById("searchSection").classList.remove("animate");
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
    this.chunkViewer.displayNNSearch(nearest);
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
    return { embedding, data: distances.slice(0, N) };
  }

  deleteData(){
    this.notes = [];
    this.chunks = [];
    this.embeddings = [];
    this.chunk2note = [];
    this.note2chunk = [];
  }
}

const notes = new Notes();
export default notes;
