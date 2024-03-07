import notes from "./Notes.js";
import openAI from "./OpenAI.js";
import notesDatabase from "./NotesDatabase.js";
import iconReader from "./IconReader.js";

class SettingsData {
  constructor(settings, displayParent) {
    this.settings = settings;
    this.displayParent = displayParent;
  }
  getDisplay() {
    const section = document.createElement("div");
    section.classList.add("settingsNode");

    const header = document.createElement("div");
    header.classList.add("settingsSectionHeader");
    header.innerText = "Data settings";
    section.appendChild(header);

    const info = document.createElement("div");
    info.classList.add("settingsInfo");
    section.appendChild(info);

    const text = document.createElement("div");
    text.classList.add("settingsText");
    text.innerText = `Delete, update, and download data`;
    info.appendChild(text);

    section.addEventListener("click", (e) => {
      this.displayChildren();
    });

    return section;
  }

  displayChildren() {
    this.settings.innerHTML = "";
    this.settings.append(this.header());
    this.settings.append(this.deleteDataSection());
    this.settings.append(this.setOpenAIKeySection());
  }

  header() {
    const header = document.createElement("div");
    header.classList.add("settingsHeader");

    const leftArrow = document.createElement("div");
    leftArrow.classList.add("settingsBack");
    leftArrow.append(iconReader.newIcon("chevronLeft", 16));
    leftArrow.addEventListener("click", (e) => {
      this.displayParent();
    });
    
    const leave = document.createElement("div");
    leave.classList.add("settingsLeave");
    leave.append(iconReader.newIcon("close", 16));
    leave.addEventListener("click", (e) => {
      this.settings.style.display = "none";
    });

    header.append(leftArrow);
    header.append(leave);

    return header;
  }

  deleteDataSection() {
    const section = document.createElement("div");
    section.classList.add("settingsSection");

    const header = document.createElement("div");
    header.classList.add("settingsSectionHeader");
    header.innerText = "Delete all data";
    section.appendChild(header);

    const info = document.createElement("div");
    info.classList.add("settingsInfo");
    section.appendChild(info);

    const text = document.createElement("div");
    text.classList.add("settingsText");
    text.innerText = `Type the word "Delete" in the text field to delete ALL your data.`;
    info.appendChild(text);

    const input = document.createElement("input");
    input.classList.add("settingsInput");
    info.append(input);

    input.addEventListener("keypress", async (event) => {
      if (event.key === "Enter" && document.activeElement == input) {
        if (input.value == "Delete") {
          notes.deleteData();
          openAI.deleteData();
          await notesDatabase.deleteData();
          this.toggle();
          location.reload();
        }
        input.value = "";
      }
    });

    return section;
  }

  setOpenAIKeySection() {
    const section = document.createElement("div");
    section.classList.add("settingsSection");

    const header = document.createElement("div");
    header.classList.add("settingsSectionHeader");
    header.innerText = "Update API key";
    section.appendChild(header);

    const info = document.createElement("div");
    info.classList.add("settingsInfo");
    section.appendChild(info);

    const text = document.createElement("div");
    text.classList.add("settingsText");
    text.innerText = `Type your API key in the text field to update your API key`;
    info.appendChild(text);

    const input = document.createElement("input");
    input.classList.add("settingsInput");
    info.append(input);

    input.addEventListener("keypress", async (event) => {
      if (event.key === "Enter" && document.activeElement == input) {
        if (input.value != "") {
          openAI.setKey(input.value);
        }
        input.value = "";
      }
    });

    return section;
  }
}
export default SettingsData;
