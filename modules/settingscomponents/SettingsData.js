import notes from "../Notes.js";
import openAI from "../OpenAI.js";
import notesDatabase from "../NotesDatabase.js";
import iconReader from "../IconReader.js";
import dataFileHandler from "./DataFileHandler.js";
import nearestNeighborGraph from "../NearestNeighborGraph.js";

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
    header.innerText = "Data";
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
    this.settings.append(this.downloadNotes());
    this.settings.append(this.loadNotes());
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

  downloadNotes() {
    const section = document.createElement("div");
    section.classList.add("settingsSection");

    const header = document.createElement("div");
    header.classList.add("settingsSectionHeader");
    header.innerText = "Download notes";
    section.appendChild(header);

    const info = document.createElement("div");
    info.classList.add("settingsInfo");
    section.appendChild(info);

    const text = document.createElement("div");
    text.classList.add("settingsText");
    text.innerText = `Press to download all of your notes.`;
    info.appendChild(text);

    const button = document.createElement("button");
    button.classList.add("settingsButton");
    button.append(iconReader.newIcon("download", 45));
    button.addEventListener("click", (e) => {
      dataFileHandler.getNotesZip();
    });
    info.append(button);

    return section;
  }

  downloadNotes() {
    const section = document.createElement("div");
    section.classList.add("settingsSection");

    const header = document.createElement("div");
    header.classList.add("settingsSectionHeader");
    header.innerText = "Download notes";
    section.appendChild(header);

    const info = document.createElement("div");
    info.classList.add("settingsInfo");
    section.appendChild(info);

    const text = document.createElement("div");
    text.classList.add("settingsText");
    text.innerText = `Press to download all of your notes.`;
    info.appendChild(text);

    const button = document.createElement("button");
    button.classList.add("settingsButton");
    button.append(iconReader.newIcon("download", 45));
    button.addEventListener("click", (e) => {
      dataFileHandler.getNotesZip();
    });
    info.append(button);

    return section;
  }

  loadNotes() {
    const section = document.createElement("div");
    section.classList.add("settingsSection");

    const header = document.createElement("div");
    header.classList.add("settingsSectionHeader");
    header.innerText = "Download notes";
    section.appendChild(header);

    const info = document.createElement("div");
    info.classList.add("settingsInfo");
    section.appendChild(info);

    const text = document.createElement("div");
    text.classList.add("settingsText");
    text.innerText = `Drag and drop your files here to load your notes.`;
    info.appendChild(text);

    const dropArea = document.createElement("div");
    dropArea.classList.add("drop-area");
    dropArea.append(iconReader.newIcon("upload", 45));

    info.appendChild(dropArea);

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ["dragenter", "dragover"].forEach((eventName) => {
      dropArea.addEventListener(
        eventName,
        () => dropArea.classList.add("highlight"),
        false
      );
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(
        eventName,
        () => dropArea.classList.remove("highlight"),
        false
      );
    });

    dropArea.addEventListener("drop", (e) => {
      let dt = e.dataTransfer;
      let files = dt.files;
      dataFileHandler.loadNotesZip(files[0]);
      
    });

    return section;
  }
}
export default SettingsData;
