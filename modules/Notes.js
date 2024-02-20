class Notes {
  constructor() {
    this.notes = [];
    this.chunks = [];
    this.embeddings = [];
    this.chunk2note = [];
    this.note2chunk = [];
    this.isSearching = false;
  }

  setData(data) {
    if (!data) {
      return;
    }
    this.notes = data.notes;
    this.chunks = data.chunks;
    this.embeddings = data.embeddings;
    this.chunk2note = data.chunk2note;
    this.note2chunk = data.note2chunk;
  }

  pushNote(note) {
    this.notes.push(note);
  }

  pushChunks(texts, embeddings) {
    const searchSection = document.getElementById("searchSection");
    searchSection.innerHTML = "";

    this.note2chunk.push([texts.length, this.chunks.length]);
    this.chunks.push(...texts);
    this.embeddings.push(...embeddings);
    texts.forEach(() => {this.chunk2note.push(this.notes.length - 1)});
    this.displayNotes(this.notes.length - 1)
  }

  getSearchText() {
    this.isSearching = true;
    const searchText = document.getElementById("searchInputSection").value;
    document.getElementById("searchInputSection").value = "";
    return searchText;
  }

  search(embedding) {
    const searchSection = document.getElementById("searchSection");
    searchSection.innerHTML = "";
    const nearest = this.nearestNeighbor(embedding, 6);

    nearest.forEach((data) => {
      const { index, distance } = data;
      const thoughtDiv = document.createElement("div");
      thoughtDiv.classList.add("thought");
      thoughtDiv.textContent = this.chunks[index];

      thoughtDiv.addEventListener("click", (e) => {
        const noteIndex = this.chunk2note[index];
        this.displayNotes(noteIndex);
      });

      const distanceIndex = document.createElement("div");
      distanceIndex.classList.add("distanceIndex");
      distanceIndex.textContent = distance.toFixed(3);

      thoughtDiv.appendChild(distanceIndex);
      searchSection.appendChild(thoughtDiv);
    });

    this.isSearching = false;
  }

  displayNotes(noteIndex) {
    const searchSection = document.getElementById("searchSection");
    searchSection.innerHTML = "";
    const chunkPositions = this.note2chunk[noteIndex];
    for (let i = 0; i < chunkPositions[0]; i++) {
      const index = chunkPositions[1] + i;
      const thoughtDiv = document.createElement("div");
      thoughtDiv.classList.add("thought");
      thoughtDiv.textContent = this.chunks[index];

      thoughtDiv.addEventListener("click", (e) => {
        this.search(this.embeddings[index]);
      });

      const distanceIndex = document.createElement("div");
      distanceIndex.classList.add("distanceIndex");
      distanceIndex.textContent = i + 1;
      thoughtDiv.appendChild(distanceIndex);

      searchSection.appendChild(thoughtDiv);
    }
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
