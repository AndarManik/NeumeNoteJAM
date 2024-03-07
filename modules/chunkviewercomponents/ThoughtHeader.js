import notes from "../Notes.js";
import contextBuilder from "../ContextBuilder.js";
import iconReader from "../IconReader.js";

class ThoughtHeader {
  constructor(callbacks) {
    this.callbacks = callbacks;
  }

  buildNoteHeader(note, index) {
    const thoughtHeader = document.createElement("div");
    thoughtHeader.classList.add("thoughtHeader");

    const searchButton = document.createElement("div");
    searchButton.classList.add("thoughtButton");
    searchButton.append(iconReader.newIcon("search", 16));
    searchButton.addEventListener("click", (e) => {
      notes.search(note.embeddings[index]);
    });
    searchButton.setAttribute("title", "Search");
    thoughtHeader.appendChild(searchButton);

    const useButton = document.createElement("div");
    useButton.classList.add("thoughtButton");
    useButton.append(iconReader.newIcon("stack", 16));
    useButton.addEventListener("click", (e) => {
      contextBuilder.addThought(note, index);
    });
    useButton.setAttribute("title", "Add to context");
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
    searchButton.append(iconReader.newIcon("search", 16));
    searchButton.addEventListener("click", (e) => {
      notes.search(note.embeddings[index]);
    });
    searchButton.setAttribute("title", "Search");
    thoughtHeader.appendChild(searchButton);

    const readButton = document.createElement("div");
    readButton.classList.add("thoughtButton");
    readButton.append(iconReader.newIcon("file", 16));
    readButton.addEventListener("click", (e) => {
      this.callbacks.displayNotes(note);
    });
    readButton.setAttribute("title", "Read note");
    thoughtHeader.appendChild(readButton);

    const useButton = document.createElement("div");
    useButton.classList.add("thoughtButton");
    useButton.append(iconReader.newIcon("stack", 16));
    useButton.addEventListener("click", (e) => {
      contextBuilder.addThought(note,index);
    });
    useButton.setAttribute("title", "Add to context");
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
    removeButton.append(iconReader.newIcon("backspace", 16));
    removeButton.addEventListener("click", (e) => {
      this.callbacks.removeContext(note.chunks[index]);
    });
    removeButton.setAttribute("title", "Remove");
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
