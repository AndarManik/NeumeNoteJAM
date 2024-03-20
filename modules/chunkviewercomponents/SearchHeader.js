import SearchHeaderButton from "./SearchHeaderButton.js";
class SearchHeader {
  constructor() {
    this.searchHeaderButton = new SearchHeaderButton();
  }

  buildAllNotesHeader() {
    return this.buildHeader([]);
  }

  buildNoteHeader(note) {
    return this.buildHeader([
      this.searchHeaderButton.buildEditButton(note),
      this.searchHeaderButton.buildRechunkButton(note),
      this.searchHeaderButton.buildDeleteButton(note),
      this.searchHeaderButton.buildNoteIdentifier(note),
    ]);
  }

  buildNearestHeader() {
    return this.buildHeader([]);
  }

  buildHeader(buttonsToAdd) {
    const leftSection = document.getElementById("leftSection");
    const header = document.createElement("div");
    header.id = "searchSectionHeader";
    leftSection.insertBefore(header, searchSection);

    const leftArrow = this.searchHeaderButton.buildLeft();
    const rightArrow = this.searchHeaderButton.buildRight();

    header.appendChild(leftArrow);
    header.append(...buttonsToAdd);
    header.appendChild(rightArrow);

    return header;
  }
}

export default SearchHeader;
