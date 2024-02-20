class Notes {
  constructor() {
    this.notes = [];
    this.chunks = [];
    this.embeddings = [];
    this.chunk2note = [];
    this.isSearching = false;
  }

  setData(data) {
    if(!data){
      return;
    }
    this.notes = data.notes;
    this.chunks = data.chunks;
    this.embeddings = data.embeddings;
    this.chunk2note = data.chunk2note;
  }

  pushNote(note) {
    this.notes.push(note);
  }

  pushChunks(texts, embeddings) {
    const searchSection = document.getElementById("searchSection");
    searchSection.innerHTML = "";
    this.chunks.push(texts);
    this.embeddings.push(embeddings);

    texts.forEach((text) => {
      this.chunk2note.push(this.notes.length - 1);

      const thoughtDiv = document.createElement("div");
      thoughtDiv.classList.add("textarea");
      thoughtDiv.classList.add("thought");
      thoughtDiv.textContent = text;

      searchSection.appendChild(thoughtDiv);
    });
  }

  getSearchText() {
    isSearching = true;

    const searchText = document.getElementById("searchSection").value;
    document.getElementById("searchSection").value = "";
    return searchText;
  }

  search(embedding) {
    const searchSection = document.getElementById("searchSection");
    searchSection.innerHTML = "";
    const nearest = this.nearestNeighbor(embedding, 6);

    nearest.forEach((index) => {
      const thoughtDiv = document.createElement("div");
      thoughtDiv.classList.add("thought");
      thoughtDiv.textContent = chunks[index];
      searchSection.appendChild(thoughtDiv);
    });

    isSearching = false;
  }

  nearestNeighbor(embedding, N) {
    const distances = embeddings.map((e, i) => {
      let sum = 0;
      for (let j = 0; j < embedding.length; j++) {
        sum += (e[j] - embedding[j]) ** 2;
      }
      return { index: i, distance: sum };
    });

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, N).map((obj) => obj.index);
  }
}

const notes = new Notes();
export default notes;
