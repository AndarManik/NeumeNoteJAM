class ChunkViewer {
  constructor(notes) {
    this.notes = notes;
  }

  displayNotes(noteIndex) {
    const searchSection = document.getElementById("searchSection");
    searchSection.innerHTML = "";
    const chunkPositions = this.notes.note2chunk[noteIndex];
    const chunks = this.notes.chunks.slice(
      chunkPositions[1],
      chunkPositions[1] + chunkPositions[0]
    );
    const embeddings = this.notes.embeddings.slice(
        chunkPositions[1],
        chunkPositions[1] + chunkPositions[0]
      );
    for (let i = 0; i < chunkPositions[0]; i++) {
      const index = chunkPositions[1] + i;
      const thoughtDiv = document.createElement("div");
      thoughtDiv.classList.add("thought");
      thoughtDiv.textContent = this.notes.chunks[index];

      thoughtDiv.addEventListener("click", (e) => {
        this.notes.search(this.notes.embeddings[index]);
      });

      const distanceIndex = document.createElement("div");
      distanceIndex.classList.add("distanceIndex");
      distanceIndex.textContent = i + 1;
      thoughtDiv.appendChild(distanceIndex);

      const editButton = document.createElement("div");
      editButton.classList.add("thoughtEdit");

      editButton.textContent = "[edit]";
      
      editButton.addEventListener("click", (e) => {
        if (this.notes.editor.noteIndex == noteIndex) {
            return;
        }
        this.notes.editor.editNote(
          this.notes.notes[noteIndex],
          chunks,
          embeddings,
          noteIndex
        );
      });
      thoughtDiv.appendChild(editButton);

      searchSection.appendChild(thoughtDiv);
    }
  }

  displayNNSearch(nearest) {
    const searchSection = document.getElementById("searchSection");

    nearest.forEach((data) => {
      const { index, distance } = data;
      const noteIndex = this.notes.chunk2note[index];
      const chunkPositions = this.notes.note2chunk[noteIndex];
      const chunks = this.notes.chunks.slice(
        chunkPositions[1],
        chunkPositions[1] + chunkPositions[0]
      );

      const embeddings = this.notes.embeddings.slice(
        chunkPositions[1],
        chunkPositions[1] + chunkPositions[0]
      );
      const thoughtDiv = document.createElement("div");
      thoughtDiv.classList.add("thought");
      thoughtDiv.textContent = this.notes.chunks[index];

      thoughtDiv.addEventListener("click", (e) => {
        this.displayNotes(noteIndex);
      });

      const distanceIndex = document.createElement("div");
      distanceIndex.classList.add("distanceIndex");
      distanceIndex.textContent = distance.toFixed(3);
      thoughtDiv.appendChild(distanceIndex);

      const distanceColor = document.createElement("div");
      distanceColor.classList.add("distanceColorBox");
      distanceColor.style.backgroundColor = this.green2red(distance / 2);
      distanceIndex.appendChild(distanceColor);

      const editButton = document.createElement("div");
      editButton.classList.add("thoughtEdit");

      editButton.textContent = "[edit]";
      editButton.addEventListener("click", (e) => {
        if (this.notes.editor.noteIndex == noteIndex) {
          return;
        }
        this.notes.editor.editNote(
          this.notes.notes[noteIndex],
          chunks,
          embeddings,
          noteIndex
        );
      });
      thoughtDiv.appendChild(editButton);

      searchSection.appendChild(thoughtDiv);
    });
  }

  green2red(value) {
    const hue = 120 * (1 - value);
    const saturation = 100; // 100% for full color
    const lightness = 40; // 50% for balanced brightness
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
}

export default ChunkViewer;
