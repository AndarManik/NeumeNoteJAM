import notes from "./Notes.js";
import notesDatabase from "./NotesDatabase.js";
import noteEditor from "./NoteEditor.js";

class ChunkViewer {
  constructor() {
    this.index = -1;
    this.headerHistory = [];
    this.thoughtHistory = [];
    this.indexHistory = [];
    this.typeHistory = [];
    this.embeddingHistory = [];
  }

  displayNotes(noteIndex) {
    const header = this.newHeader([
      this.newEditButton(noteIndex),
      this.newRechunkButton(noteIndex),
      this.newDeleteButton(noteIndex),
      this.newNoteIdentifier(noteIndex),
    ]);

    const searchSection = this.newNoteSearchSection(noteIndex);

    this.index++;

    this.setDisplay(header, searchSection);

    this.headerHistory[this.index] = header;
    this.thoughtHistory[this.index] = searchSection;
    this.indexHistory[this.index] = noteIndex;
    this.typeHistory[this.index] = "noteDisplay";

    this.headerHistory.length = this.index + 1;
    this.thoughtHistory.length = this.index + 1;
    this.indexHistory.length = this.index + 1;
    this.typeHistory.length = this.index + 1;
  }

  setNoteSearchSection(noteIndex) {
    const header = document.getElementById("searchSectionHeader");
    const searchSection = this.newNoteSearchSection(noteIndex);
    this.setDisplay(header, searchSection);
    this.thoughtHistory[this.index] = searchSection;
  }

  newNoteSearchSection(noteIndex) {
    const searchSection = document.createElement("div");
    searchSection.id = "searchSection";

    const chunkPositions = notes.note2chunk[noteIndex];
    for (let i = 0; i < chunkPositions[0]; i++) {
      const index = chunkPositions[1] + i;
      const thoughtDiv = document.createElement("div");
      thoughtDiv.classList.add("thought");

      const thoughtHeader = document.createElement("div");
      thoughtHeader.classList.add("thoughtHeader");

      const searchButton = document.createElement("div");
      searchButton.classList.add("thoughtButton");
      searchButton.innerText = "Search";
      const thoughtEmbedding = notes.embeddings[index];
      searchButton.addEventListener("click", (e) => {
        notes.search(thoughtEmbedding);
      });
      thoughtHeader.appendChild(searchButton);
      
      const useButton = document.createElement("div");
      useButton.classList.add("thoughtButton");
      useButton.innerText = "Use";
      useButton.addEventListener("click", e => {
        noteEditor.contextBuilder.addThought(thoughtDiv);
      });
      thoughtHeader.appendChild(useButton);

      thoughtDiv.appendChild(thoughtHeader);
      const text = document.createElement("p");
      text.textContent += notes.chunks[index];
      thoughtDiv.appendChild(text);

      searchSection.appendChild(thoughtDiv);
    }
    return searchSection;
  }

  displayNNSearch(nearest) {
    const header = this.newHeader([]);

    const searchSection = this.newNearestSearchSection(nearest);

    this.index++;

    this.setDisplay(header, searchSection);

    this.headerHistory[this.index] = header;
    this.thoughtHistory[this.index] = searchSection;
    this.indexHistory[this.index] = nearest.data.map(
      (d) => notes.chunk2note[d.index]
    );
    this.typeHistory[this.index] = "nearestDisplay";
    this.embeddingHistory[this.index] = nearest.embedding;

    this.headerHistory.length = this.index + 1;
    this.thoughtHistory.length = this.index + 1;
    this.indexHistory.length = this.index + 1;
    this.typeHistory.length = this.index + 1;
    this.embeddingHistory.length = this.index + 1;
  }

  newNearestSearchSection(nearest) {
    const searchSection = document.createElement("div");
    searchSection.id = "searchSection";

    nearest.data.forEach((data) => {
      const { index, distance } = data;
      const noteIndex = notes.chunk2note[index];

      const thoughtDiv = document.createElement("div");
      thoughtDiv.classList.add("thought");

      const thoughtHeader = document.createElement("div");
      thoughtHeader.classList.add("thoughtHeader");

      const distanceColor = document.createElement("div");
      distanceColor.classList.add("distanceColorBox");
      distanceColor.style.backgroundColor = this.green2red(distance / 2);
      thoughtHeader.appendChild(distanceColor);

      const distanceIndex = document.createElement("div");
      distanceIndex.classList.add("distanceIndex");
      distanceIndex.textContent = distance.toFixed(3);
      thoughtHeader.appendChild(distanceIndex);

      const searchButton = document.createElement("div");
      searchButton.classList.add("thoughtButton");
      searchButton.innerText = "Search";
      searchButton.addEventListener("click", (e) => {
        notes.search(notes.embeddings[index]);
      });
      thoughtHeader.appendChild(searchButton);

      const readButton = document.createElement("div");
      readButton.classList.add("thoughtButton");
      readButton.textContent = "Read";
      readButton.addEventListener("click", (e) => {
        this.displayNotes(noteIndex);
      });
      thoughtHeader.appendChild(readButton);
      thoughtDiv.appendChild(thoughtHeader);

      const useButton = document.createElement("div");
      useButton.classList.add("thoughtButton");
      useButton.innerText = "Use";
      useButton.addEventListener("click", e => {
        noteEditor.contextBuilder.addThought(thoughtDiv);
      });
      thoughtHeader.appendChild(useButton);

      const noteIdentifier = this.newNoteIdentifier(noteIndex);
      thoughtHeader.appendChild(noteIdentifier);

      const text = document.createElement("p");
      text.textContent += notes.chunks[index];
      thoughtDiv.appendChild(text);

      searchSection.appendChild(thoughtDiv);
    });
    return searchSection;
  }

  newHeader(buttonsToAdd) {
    const leftSection = document.getElementById("leftSection");
    const header = document.createElement("div");
    header.id = "searchSectionHeader";
    leftSection.insertBefore(header, searchSection);

    const leftArrow = document.createElement("div");
    leftArrow.classList.add("searchSectionButton");
    leftArrow.innerText = "<";
    leftArrow.addEventListener("click", (e) => {
      this.goBack();
    });

    const rightArrow = document.createElement("div");
    rightArrow.classList.add("searchSectionButton");
    rightArrow.innerText = ">";
    rightArrow.addEventListener("click", (e) => {
      this.goForward();
    });

    header.appendChild(leftArrow);
    header.append(...buttonsToAdd);
    header.appendChild(rightArrow);

    return header;
  }

  goBack() {
    this.index = Math.max(this.index - 1, 0);
    this.setDisplay(
      this.headerHistory[this.index],
      this.thoughtHistory[this.index]
    );
  }

  goForward() {
    this.index = Math.min(this.headerHistory.length - 1, this.index + 1);
    this.setDisplay(
      this.headerHistory[this.index],
      this.thoughtHistory[this.index]
    );
  }

  setDisplay(header, searchSection) {
    const leftSection = document.getElementById("leftSection");
    const searchInputSection = document.getElementById("searchInputSection");

    while (leftSection.firstChild) {
      leftSection.firstChild.remove();
    }
    if (!searchSection) {
      searchSection = document.createElement("div");
      searchSection.id = "searchSection";
      leftSection.appendChild(searchInputSection);
      leftSection.appendChild(searchSection);
      return;
    }

    searchSection.classList.remove("animate");

    leftSection.appendChild(searchInputSection);
    leftSection.appendChild(header);
    leftSection.appendChild(searchSection);

    console.log(this.index);
    console.log(header);
    console.log(searchSection);
  }

  newEditButton(noteIndex) {
    const editButton = document.createElement("div");
    editButton.classList.add("searchSectionButton");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", (e) => {
      if (noteEditor.tabNoteIndexs.indexOf(noteIndex) != -1) {
        return;
      }

      const unique = this.uniqueColor(noteIndex);

      noteEditor.editNote(notes.notes[noteIndex], noteIndex, unique);
    });

    return editButton;
  }

  newRechunkButton(noteIndex) {//this needs to inform the rest of the history of the change
    const reChunkButton = document.createElement("div");
    reChunkButton.classList.add("searchSectionButton");
    reChunkButton.textContent = "Rechunk";
    reChunkButton.addEventListener("click", async (e) => {
      await notes.reChunk(noteIndex);
      notesDatabase.saveNotesData(notes);
      this.setNoteSearchSection(noteIndex);
    });
    return reChunkButton;
  }

  newDeleteButton(noteIndex) {
    const deleteButton = document.createElement("div");
    deleteButton.classList.add("searchSectionButton");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", (e) => {
      notes.delete(noteIndex);
      noteEditor.deleteTab(noteIndex);
      this.handleDelete(noteIndex);
      if (this.index < 0) {
        if (this.headerHistory.length != 0) {
          this.index = 0;
          this.setDisplay(
            this.headerHistory[this.index],
            this.thoughtHistory[this.index]
          );
        } else {
          this.index = -1;
          this.setDisplay(null, null);
        }
      } else {
        this.setDisplay(
          this.headerHistory[this.index],
          this.thoughtHistory[this.index]
        );
      }

      notesDatabase.saveNotesData(notes);
    });
    return deleteButton;
  }

  handleDelete(noteIndex) {
    this.typeHistory.forEach((type, index) => {
      if (
        type == "nearestDisplay" &&
        this.indexHistory[index].includes(noteIndex)
      ) {
        const embedding = this.embeddingHistory[index];
        const nearest = notes.nearestNeighbor(embedding, 10);
        this.thoughtHistory[index] = this.newNearestSearchSection(nearest);
        this.indexHistory[index] = nearest.data.map(
          (d) => notes.chunk2note[d.index]
        );
      } else {
        if (type == "nearestDisplay") {
          this.indexHistory[index] = this.indexHistory[index].map((i) =>
            i > noteIndex ? i - 1 : i
          );
        }
      }
    });

    for (let i = this.headerHistory.length - 1; i >= 0; i--) {
      if (
        this.typeHistory[i] == "noteDisplay" &&
        this.indexHistory[i] == noteIndex
      ) {
        this.headerHistory.splice(i, 1);
        this.thoughtHistory.splice(i, 1);
        this.indexHistory.splice(i, 1);
        this.typeHistory.splice(i, 1);
        this.embeddingHistory.splice(i, 1);

        if (i <= this.index) {
          this.index--;
        }
      }
    }
  }

  newNoteIdentifier(noteIndex) {
    const noteIdentifier = document.createElement("div");
    noteIdentifier.classList.add("distanceColorBox");
    noteIdentifier.style.background = this.uniqueColor(noteIndex);
    noteIdentifier.style.marginLeft = "auto";
    noteIdentifier.style.marginRight = "0.2em";
    return noteIdentifier;
  }

  green2red(value) {
    const hue = 120 * (1 - value);
    const saturation = 100; // 100% for full color
    const lightness = 40; // 40% for slightly more contrast with pure white background
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  uniqueColor(index) {
    const newIndex = index + 1;
    const goldenRatio = 1.618033988749895;
    const outerHue = 360 * ((goldenRatio * newIndex) % 1);
    const innerHue = 360 * ((goldenRatio * 17 * (newIndex + 1)) % 1);
    return `radial-gradient(circle, hsl(${outerHue}, 100%, 50%) 0%, hsl(${innerHue}, 100%, 50%) 100%)`;
  }
}

export default ChunkViewer;
