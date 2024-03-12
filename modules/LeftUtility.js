import chunkViewer from "./ChunkViewer.js";
import iconReader from "./IconReader.js";
class LeftUtility {
  initialize() {
    const iconSize = 22

    const toggleReader = document.createElement("div");
    toggleReader.classList.add("leftHeaderbutton");
    toggleReader.append(iconReader.newIcon("file", iconSize));
    toggleReader.addEventListener("click", (e) => this.displayAllNotes());
    document.getElementById("leftHeader").append(toggleReader);

    const toggleSearch = document.createElement("div");
    toggleSearch.classList.add("leftHeaderbutton");
    toggleSearch.append(iconReader.newIcon("search", iconSize));
    toggleSearch.addEventListener("click", (e) => this.toggleSearch());
    document.getElementById("leftHeader").append(toggleSearch);

    const toggleContext = document.createElement("div");
    toggleContext.classList.add("leftHeaderbutton");
    toggleContext.append(iconReader.newIcon("stack", iconSize));
    toggleContext.addEventListener("click", (e) => this.toggleContext());
    document.getElementById("leftHeader").append(toggleContext);
  }
  toggleSearch() {
    const leftSection = document.getElementById("leftSection");

    if (leftSection.style.display == "none") {
      leftSection.style.display = "flex";
    } else {
      leftSection.style.display = "none";
    }
  }

  displayAllNotes() {
    chunkViewer.displayAllNotes();
    if (leftSection.style.display == "none") {
      leftSection.style.display = "flex";
    } 
  }

  toggleContext() {
    const contextBuilder = document.getElementById("contextBuilder");
    if (!contextBuilder) {
      return;
    }
    if (contextBuilder.style.display == "none") {
      contextBuilder.style.display = "flex";
    } else {
      contextBuilder.style.display = "none";
    }
  }
}
const leftUtility = new LeftUtility();
export default leftUtility;
