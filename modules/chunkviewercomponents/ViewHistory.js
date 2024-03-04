import SearchHeader from "./SearchHeader.js";
import SearchSection from "./SearchSection.js";

class ViewHistory {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.searchHeader = new SearchHeader(callbacks);
    this.searchSection = new SearchSection(callbacks);
  }

  buildNoteDisplay(note) {
    const header = this.searchHeader.buildNoteHeader(note);
    const searchSection = this.searchSection.buildNoteSearchSection(note);
    const type = "note";
    return { notes: [note], header, searchSection, type };
  }

  buildNearestDisplay(nearest) {
    const header = this.searchHeader.buildNearestHeader();
    const searchSection = this.searchSection.buildNearestSearchSection(nearest);
    const type = "nearest";
    return {
      notes: nearest.data.map((data) => {
        return data.note;
      }),
      header,
      searchSection,
      type,
      embedding: nearest.embedding,
    };
  }
}

export default ViewHistory;
