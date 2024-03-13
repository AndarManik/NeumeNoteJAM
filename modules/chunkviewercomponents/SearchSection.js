import Thought from "./Thought.js";
import notes from "../Notes.js";

class SearchSection {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.thought = new Thought(callbacks);
  }

  buildAllNotesSearchSection(){
    const searchSection = document.createElement("div");
    searchSection.id = "searchSection";

    notes.notes.slice().reverse().forEach(note => {
      const thought = this.thought.buildAllNoteThought(note);
        searchSection.append(thought);
    });

    return searchSection;
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
