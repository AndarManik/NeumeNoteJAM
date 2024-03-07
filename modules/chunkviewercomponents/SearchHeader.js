import iconReader from "../IconReader.js";
import SearchHeaderButton from "./SearchHeaderButton.js";
class SearchHeader {
    constructor(callbacks){
        this.callbacks = callbacks;
        this.searchHeaderButton = new SearchHeaderButton(callbacks);
    }

    buildNoteHeader(note){
        return this.buildHeader([
            this.searchHeaderButton.buildEditButton(note),
            this.searchHeaderButton.buildRechunkButton(note),
            this.searchHeaderButton.buildDeleteButton(note),
            this.searchHeaderButton.buildNoteIdentifier(note),
          ]);
    }

    buildNearestHeader(){
        return this.buildHeader([]);
    }

    buildHeader(buttonsToAdd) {
        const leftSection = document.getElementById("leftSection");
        const header = document.createElement("div");
        header.id = "searchSectionHeader";
        leftSection.insertBefore(header, searchSection);
    
        const leftArrow = document.createElement("div");
        leftArrow.classList.add("searchSectionButton");
        leftArrow.append(iconReader.newIcon("chevronLeft", 22));
        leftArrow.addEventListener("click", (e) => {
          this.callbacks.goBack();
        });
    
        const rightArrow = document.createElement("div");
        rightArrow.classList.add("searchSectionButton");
        rightArrow.append(iconReader.newIcon("chevronRight", 22));
        rightArrow.addEventListener("click", (e) => {
            this.callbacks.goForward();
        });
    
        header.appendChild(leftArrow);
        header.append(...buttonsToAdd);
        header.appendChild(rightArrow);
    
        return header;
      }
}

export default SearchHeader;