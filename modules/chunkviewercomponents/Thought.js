import ThoughtHeader from "./ThoughtHeader.js";
class Thought {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.thoughtHeader = new ThoughtHeader(callbacks);
  }

  buildAllNoteThought(note) {
    const thoughtDiv = document.createElement("div");
    thoughtDiv.classList.add("thought");
    const header = this.thoughtHeader.buildAllNoteHeader(note);
    thoughtDiv.append(header);

    const text = document.createElement("p");
    text.textContent += note.title;
    thoughtDiv.appendChild(text);
    return thoughtDiv;
  }

  buildNoteThought(note, index) {
    const thoughtDiv = document.createElement("div");
    thoughtDiv.classList.add("thought");
    const header = this.thoughtHeader.buildNoteHeader(note, index);
    thoughtDiv.append(header);

    const text = document.createElement("p");
    text.textContent += note.chunks[index];
    thoughtDiv.appendChild(text);
    return thoughtDiv;
  }

  buildNearestThought(note, index, distance) {
    const thoughtDiv = document.createElement("div");
    thoughtDiv.classList.add("thought");
    const header = this.thoughtHeader.buildNearestHeader(note, index, distance);
    thoughtDiv.append(header);

    const text = document.createElement("p");
    text.textContent += note.chunks[index];
    thoughtDiv.appendChild(text);
    return thoughtDiv;
  }

  buildContextthought(note, index) {
    const thoughtDiv = document.createElement("div");
    thoughtDiv.classList.add("thought");
    const header = this.thoughtHeader.buildContextHeader(note, index);
    thoughtDiv.append(header);

    const text = document.createElement("p");
    text.textContent += note.chunks[index];
    thoughtDiv.appendChild(text);
    return thoughtDiv;
  }

  buildGraphthought(note, index) {
    const thoughtDiv = document.createElement("div");
    thoughtDiv.classList.add("thought");
    const header = this.thoughtHeader.buildGraphHeader(note, index);
    thoughtDiv.append(header);

    const text = document.createElement("p");
    text.textContent += note.chunks[index];
    thoughtDiv.appendChild(text);
    return thoughtDiv;
  }
}
export default Thought;
