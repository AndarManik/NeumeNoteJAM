import instances from "./NeumeEngine.js";
import ViewHistory from "./chunkviewercomponents/ViewHistory.js";

class ChunkViewer {
  constructor() {
    this.index = -1;
    this.history = [];

    const callbacks = {
      goBack: this.goBack.bind(this),
      goForward: this.goForward.bind(this),
      setDisplay: this.setNoteSearchSection.bind(this),
      handleDelete: this.handleDelete.bind(this),
      displayNotes: this.displayNotes.bind(this),
      handleRechunk: this.handleRechunk.bind(this)
    };
    this.viewHistory = new ViewHistory(callbacks);
  }

  goBack() {
    this.index = Math.max(this.index - 1, 0);
    this.setDisplay(
      this.history[this.index]
    );
  }

  goForward() {
    this.index = Math.min(this.history.length - 1, this.index + 1);
    this.setDisplay(
      this.history[this.index]
    );
  }

  displayNotes(note) {
    const noteDisplay = this.viewHistory.buildNoteDisplay(note);
    this.index++;
    this.setDisplay(noteDisplay);
    this.history[this.index] = noteDisplay;
    this.history.length = this.index + 1;
  }

  displayNearestSearch(nearest) {
    const nearestDisplay = this.viewHistory.buildNearestDisplay(nearest);
    this.index++;
    this.setDisplay(nearestDisplay);
    this.history[this.index] = nearestDisplay;
    this.history.length = this.index + 1;
  }

  setDisplay(viewHistory) {
    const leftSection = document.getElementById("leftSection");
    const searchInputSection = document.getElementById("searchInputSection");

    while (leftSection.firstChild) {
      leftSection.firstChild.remove();
    }
    if (!viewHistory) {
      const searchSection = document.createElement("div");
      searchSection.id = "searchSection";
      leftSection.appendChild(searchInputSection);
      leftSection.appendChild(searchSection);
      return;
    }

    leftSection.appendChild(searchInputSection);
    leftSection.appendChild(viewHistory.header);
    leftSection.appendChild(viewHistory.searchSection);
  }

  setNoteSearchSection(note) {
    const noteDisplay = this.viewHistory.buildNoteDisplay(note);
    this.setDisplay(noteDisplay);
    this.history[this.index] = noteDisplay;
  }

  handleDelete(note) {
    this.history.forEach((viewHistory, index) => {
      if (viewHistory.type == "nearest" && viewHistory.notes.includes(note)) {
        const embedding = viewHistory.embedding;
        const nearest = instances.notes.nearestNeighbor(embedding, 10);
        this.history[index] = this.viewHistory.buildNearestDisplay(nearest);
      }
    });

    for (let i = this.history.length - 1; i >= 0; i--) {
      if (
        this.history[i].type == "note" &&
        this.history[i].notes.includes(note)
      ) {
        this.history.splice(i, 1);

        if (i <= this.index) {
          this.index--;
        }
      }
    }

    if (this.index < 0) {
      if (this.history.length != 0) {
        this.index = 0;
        this.setDisplay(this.history[this.index]);
      } else {
        this.index = -1;
        this.setDisplay(null);
      }
    } else {
      this.setDisplay(
        this.history[this.index],
      );
    }
  }

  handleRechunk(note){
    this.history.forEach((viewHistory, index) => {
      if(viewHistory.notes.includes(note)){
        if (viewHistory.type == "nearest") {
          const embedding = viewHistory.embedding;
          const nearest = instances.notes.nearestNeighbor(embedding, 10);
          this.history[index] = this.viewHistory.buildNearestDisplay(nearest);
        }
        else {
          this.history[index] = this.viewHistory.buildNoteDisplay(note);
        }
      }
      
    });
  }

  isCurrentHistory(note){
    return this.history[this.index] && this.history[this.index].type == "note" && this.history[this.index].notes[0] == note;
  }
}

const chunkViewer = new ChunkViewer();
instances.chunkViewer = chunkViewer;

export default chunkViewer;
