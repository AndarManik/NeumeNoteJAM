import notes from "../Notes.js";
import contextBuilder from "../ContextBuilder.js";
import iconReader from "../IconReader.js";
import chunkViewer from "../ChunkViewer.js";

class ThoughtHeader {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.iconSize = 14;
    this.searchSectionWidth =
      document.getElementById("searchSection").offsetWidth;
    console.log(this.searchSectionWidth);
  }

  buildAllNoteHeader(note) {
    const thoughtHeader = document.createElement("div");
    thoughtHeader.classList.add("thoughtHeader");
    thoughtHeader.appendChild(this.buildReadButton(note));
    thoughtHeader.appendChild(this.newNoteIdentifier(note));
    return thoughtHeader;
  }

  buildNoteHeader(note, index) {
    const thoughtHeader = document.createElement("div");
    thoughtHeader.classList.add("thoughtHeader");
    thoughtHeader.appendChild(this.buildSearchButton(note, index));
    thoughtHeader.appendChild(this.buildUseButton(note, index));
    return thoughtHeader;
  }

  buildNearestHeader(note, index, distance) {
    const thoughtHeader = document.createElement("div");
    thoughtHeader.classList.add("thoughtHeader");

    const distanceColor = document.createElement("div");
    distanceColor.classList.add("distanceColorBox");
    distanceColor.style.backgroundColor = this.green2red(distance / 2);
    thoughtHeader.appendChild(distanceColor);

    thoughtHeader.appendChild(this.buildSearchButton(note, index));
    thoughtHeader.appendChild(this.buildReadButton(note));
    thoughtHeader.appendChild(this.buildUseButton(note, index));
    thoughtHeader.appendChild(this.newNoteIdentifier(note));
    return thoughtHeader;
  }

  buildGraphHeader(note, index) {
    const thoughtHeader = document.createElement("div");
    thoughtHeader.classList.add("thoughtHeader");
    thoughtHeader.appendChild(this.buildSearchButton(note, index));
    thoughtHeader.appendChild(this.buildReadButton(note));
    return thoughtHeader;
  }

  buildContextHeader(note, index) {
    const thoughtHeader = document.createElement("div");
    thoughtHeader.classList.add("thoughtHeader");

    const removeButton = document.createElement("div");
    removeButton.classList.add("thoughtButton");
    removeButton.append(iconReader.newIcon("backspace", this.iconSize));
    removeButton.addEventListener("click", (e) => {
      contextBuilder.removeContext(note.chunks[index]);
    });
    removeButton.setAttribute("title", "Remove");
    removeButton.style.visibility = "hidden";

    thoughtHeader.appendChild(removeButton);
    thoughtHeader.appendChild(this.buildSearchButton(note, index));
    thoughtHeader.appendChild(this.buildReadButton(note));
    const noteIdentifier = this.newNoteIdentifier(note);
    thoughtHeader.appendChild(noteIdentifier);
    return thoughtHeader;
  }

  buildSearchButton(note, index) {
    const searchButton = document.createElement("div");
    searchButton.classList.add("thoughtButton");
    searchButton.append(iconReader.newIcon("search", this.iconSize));
    searchButton.addEventListener("click", (e) => {
      notes.searchEmbedding(note.embeddings[index]);
    });
    searchButton.setAttribute("title", "Search");
    searchButton.style.left = `${this.searchSectionWidth / 4}px`;
    searchButton.style.transform = "translateX(-50%)";
    searchButton.style.visibility = "hidden";
    return searchButton;
  }

  buildReadButton(note){
    const readButton = document.createElement("div");
    readButton.classList.add("thoughtButton");
    readButton.append(iconReader.newIcon("file", this.iconSize));
    readButton.addEventListener("click", (e) => {
      chunkViewer.displayNotes(note);
    });
    readButton.setAttribute("title", "Read note");
    readButton.style.left = `${(2 * this.searchSectionWidth) / 4}px`;
    readButton.style.transform = "translateX(-50%)";
    readButton.style.visibility = "hidden";
    return readButton;
  }

  buildUseButton(note, index){
    const useButton = document.createElement("div");
    useButton.classList.add("thoughtButton");
    useButton.append(iconReader.newIcon("stack", this.iconSize));
    useButton.addEventListener("click", (e) => {
      contextBuilder.addThought(note, index);
    });
    useButton.setAttribute("title", "Add to context");
    useButton.style.left = `${(3 * this.searchSectionWidth) / 4}px`;
    useButton.style.transform = "translateX(-50%)";
    useButton.style.visibility = "hidden";
    return useButton;
  }

  newNoteIdentifier(note) {
    const noteIdentifier = document.createElement("div");
    noteIdentifier.classList.add("distanceColorBox");
    noteIdentifier.style.background = note.getColor();
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
