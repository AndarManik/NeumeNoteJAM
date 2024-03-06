import notes from "../Notes.js";
import contextBuilder from "../ContextBuilder.js";
class ThoughtHeader {
  constructor(callbacks) {
    this.callbacks = callbacks;
  }

  buildNoteHeader(note, index) {
    const thoughtHeader = document.createElement("div");
    thoughtHeader.classList.add("thoughtHeader");

    const searchButton = document.createElement("div");
    searchButton.classList.add("thoughtButton");
    searchButton.innerText = "Search";
    searchButton.addEventListener("click", (e) => {
      notes.search(note.embeddings[index]);
    });
    thoughtHeader.appendChild(searchButton);

    const useButton = document.createElement("div");
    useButton.classList.add("thoughtButton");
    useButton.innerText = "Use";
    useButton.addEventListener("click", (e) => {
      contextBuilder.addThought(note, index);
    });
    thoughtHeader.appendChild(useButton);

    return thoughtHeader;
  }

  buildNearestHeader(note, index, distance) {
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
      notes.search(note.embeddings[index]);
    });
    thoughtHeader.appendChild(searchButton);

    const readButton = document.createElement("div");
    readButton.classList.add("thoughtButton");
    readButton.textContent = "Read";
    readButton.addEventListener("click", (e) => {
      this.callbacks.displayNotes(note);
    });
    thoughtHeader.appendChild(readButton);

    const useButton = document.createElement("div");
    useButton.classList.add("thoughtButton");
    useButton.innerText = "Use";
    useButton.addEventListener("click", (e) => {
      contextBuilder.addThought(note,index);
    });
    thoughtHeader.appendChild(useButton);

    const noteIdentifier = this.newNoteIdentifier(note);
    thoughtHeader.appendChild(noteIdentifier);

    return thoughtHeader;
  }

  buildContextHeader(note, index) {
    const thoughtHeader = document.createElement("div");
    thoughtHeader.classList.add("thoughtHeader");

    const removeButton = document.createElement("div");
    removeButton.classList.add("thoughtButton");
    removeButton.innerText = "Remove";
    removeButton.addEventListener("click", (e) => {
      this.callbacks.removeContext(note.chunks[index]);
    });
    thoughtHeader.appendChild(removeButton);

    const noteIdentifier = this.newNoteIdentifier(note);
    thoughtHeader.appendChild(noteIdentifier);

    return thoughtHeader;
  }

  newNoteIdentifier(note) {
    const noteIdentifier = document.createElement("div");
    noteIdentifier.classList.add("distanceColorBox");
    noteIdentifier.style.background = note.color;
    noteIdentifier.style.marginLeft = "auto";
    noteIdentifier.style.marginRight = "0.2em";
    return noteIdentifier;
  }

  green2red(value) {
    const hue = 120 * (1 - value);
    const saturation = 100; // 100% for full color
    const lightness = 50; // 40% for slightly more contrast with pure white background
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
}
export default ThoughtHeader;
