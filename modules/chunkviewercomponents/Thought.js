import ThoughtHeader from "./ThoughtHeader.js";
class Thought {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.thoughtHeader = new ThoughtHeader(callbacks);
  }

  buildThought(header, textToInsert) {
    const thoughtDiv = document.createElement("div");
    thoughtDiv.classList.add("thought");
    thoughtDiv.append(header);

    const text = document.createElement("p");
    text.textContent += textToInsert;
    thoughtDiv.appendChild(text);

    thoughtDiv.addEventListener("mouseenter", () => {
      thoughtDiv.querySelectorAll(".thoughtButton").forEach((button) => {
        button.style.visibility = "visible";
      });
    });
    thoughtDiv.addEventListener("mouseleave", () => {
      thoughtDiv.querySelectorAll(".thoughtButton").forEach((button) => {
        button.style.visibility = "hidden";
      });
    });

    return thoughtDiv;
  }

  buildAllNoteThought(note) {
    return this.buildThought(
      this.thoughtHeader.buildAllNoteHeader(note),
      note.title
    );
  }

  buildNoteThought(note, index) {
    return this.buildThought(
      this.thoughtHeader.buildNoteHeader(note, index),
      note.chunks[index]
    );
  }

  buildNearestThought(note, index, distance) {
    return this.buildThought(
      this.thoughtHeader.buildNearestHeader(note, index, distance),
      note.chunks[index]
    );
  }

  buildContextThought(note, index) {
    return this.buildThought(
      this.thoughtHeader.buildContextHeader(note, index),
      note.chunks[index]
    );
  }

  buildGraphThought(note, index) {
    return this.buildThought(
      this.thoughtHeader.buildGraphHeader(note, index),
      note.chunks[index]
    );
  }
}
export default Thought;
