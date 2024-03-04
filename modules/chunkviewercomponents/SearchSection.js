import Thought from "./Thought.js";
class SearchSection {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.thought = new Thought(callbacks);
  }

  buildNoteSearchSection(note) {
    const searchSection = document.createElement("div");
    searchSection.id = "searchSection";

    note.chunks.forEach((chunk, index) => {
        const thought = this.thought.buildNoteThought(note, index);
        searchSection.append(thought);
    })

    return searchSection;
  }

  buildNearestSearchSection(nearest) {
    const searchSection = document.createElement("div");
    searchSection.id = "searchSection";

    nearest.data.forEach(data => {
        const {note, index, distance} = data;
        const thought = this.thought.buildNearestThought(note, index, distance);
        searchSection.append(thought);
    })

    return searchSection;
  }
}
export default SearchSection;
