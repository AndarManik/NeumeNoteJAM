import Thought from "./chunkviewercomponents/Thought.js";
class ContextBuilder {
  constructor() {
    this.context = [];
    this.contextThoughts = [];
    this.middleSection = document.getElementById("middleSection");
    this.contextBuilder = document.createElement("div");
    this.contextBuilder.id = "contextBuilder";
  }

  initialize() {
    this.thought = new Thought();
  }

  addThought(note, index) {
    if (this.context.indexOf(note.chunks[index]) != -1) {
      return;
    }
    if (!this.context.length) {
      this.middleSection.append(this.contextBuilder);
    }

    const text = note.chunks[index];
    this.context.push(text);

    const thoughtClone = this.thought.buildContextThought(note, index);

    this.contextThoughts.push(thoughtClone);
    this.contextBuilder.append(thoughtClone);
  }

  getContextPrompt() {
    var contextPrompt = "External Context: {";
    this.context.forEach((text) => {
      contextPrompt += `, "${text}"`;
    });
    contextPrompt += "}";
    return contextPrompt;
  }

  removeContext(text) {
    const index = this.context.indexOf(text);
    console.log("addThought", index);

    this.context.splice(index, 1);
    this.contextThoughts.splice(index, 1)[0].remove();

    if (!this.context.length) {
      this.contextBuilder.remove();
    }
  }
}
const contextBuilder = new ContextBuilder();
export default contextBuilder;
