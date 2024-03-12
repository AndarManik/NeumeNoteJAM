import SearchHeader from "./SearchHeader.js";
import SearchSection from "./SearchSection.js";
import notes from "../Notes.js";
class ViewHistory {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.searchHeader = new SearchHeader(callbacks);
    this.searchSection = new SearchSection(callbacks);
  }

  buildAllNotesDisplay(){
    const header = this.searchHeader.buildAllNotesHeader();
    const searchSection = this.searchSection.buildAllNotesSearchSection();
    const type = "all";
    return { notes: notes.notes, header, searchSection, type };
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
