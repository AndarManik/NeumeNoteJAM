class ContextListener {
  constructor() {
    this.isCompleteActive = false;
    this.isSearchInputActive = false;
  }
  setListener() {
    const completeSection = document.getElementById("completeSection");
    const searchInputSection = document.getElementById("searchInputSection");

    completeSection.addEventListener("blur", () => {
      this.isCompleteActive = false;
    });
    completeSection.addEventListener("focus", () => {
      this.isCompleteActive = true;
    });
    searchInputSection.addEventListener("blur", () => {
      this.isSearchInputActive = false;
    });
    searchInputSection.addEventListener("focus", () => {
      this.isSearchInputActive = true;
    });
  }
}

const contextListener = new ContextListener();
export default contextListener;
