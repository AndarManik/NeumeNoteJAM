import chunkViewer from "./ChunkViewer.js";
import iconReader from "./IconReader.js";
import graphViewer from "./GraphViewer.js";
class LeftUtility {
  initialize() {
    const iconSize = 22

    const toggleReader = document.createElement("div");
    toggleReader.classList.add("leftHeaderbutton");
    toggleReader.append(iconReader.newIcon("file", iconSize));
    toggleReader.addEventListener("click", (e) => this.displayAllNotes());
    toggleReader.setAttribute("title", "Show all notes");
    document.getElementById("leftHeader").append(toggleReader);

    const toggleSearch = document.createElement("div");
    toggleSearch.classList.add("leftHeaderbutton");
    toggleSearch.append(iconReader.newIcon("search", iconSize));
    toggleSearch.addEventListener("click", (e) => this.toggleSearch());
    toggleSearch.setAttribute("title", "Toggle search section");
    document.getElementById("leftHeader").append(toggleSearch);

    const toggleContext = document.createElement("div");
    toggleContext.classList.add("leftHeaderbutton");
    toggleContext.append(iconReader.newIcon("stack", iconSize));
    toggleContext.addEventListener("click", (e) => this.toggleContext());
    toggleContext.setAttribute("title", "Toggle context builder");
    document.getElementById("leftHeader").append(toggleContext);

    const toggleGraph = document.createElement("div");
    toggleGraph.classList.add("leftHeaderbutton");
    toggleGraph.append(iconReader.newIcon("sitemap", iconSize));
    toggleGraph.addEventListener("click", (e) => this.toggleGraph());
    toggleGraph.setAttribute("title", "Toggle graph view");
    document.getElementById("leftHeader").append(toggleGraph);
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

  toggleGraph() {
    graphViewer.toggle();
  }
}
const leftUtility = new LeftUtility();
export default leftUtility;
