import notes from "./Notes.js";
import openAI from "./OpenAI.js";
import notesDatabase from "./NotesDatabase.js";
import displayApiInput from "./ApiKeyReader.js";

class Settings {
  constructor() {
    this.settings = document.createElement("div");
    this.settings.classList.add("settings");
    this.settings.style.display = "none";

    this.settings.append(this.deleteDataSection());

    document.body.appendChild(this.settings);
  }

  toggle(){
    if(this.settings.style.display == "none"){
        this.settings.style.display = "block";
    }
    else {
        this.settings.style.display = "none"
    }
  }

  deleteDataSection(){
    const section = document.createElement("div");
    section.classList.add("settingsSection");
    
    const header = document.createElement("div");
    header.classList.add("settingsSectionHeader");
    header.innerText = "Delete all data"
    section.appendChild(header);

    const info = document.createElement("div");
    info.classList.add("settingsInfo");
    section.appendChild(info);

    const text = document.createElement("div");
    text.classList.add("settingsText");
    text.innerText = `Type the word "Delete" in the text field to delete ALL your data.`
    info.appendChild(text);

    const input = document.createElement("input");
    input.classList.add("settingsInput");
    info.append(input);

    input.addEventListener("keypress", async (event) => {
        if (event.key === "Enter" && document.activeElement == input) {
          if(input.value == "Delete"){
            notes.deleteData();
            openAI.deleteData();
            await notesDatabase.deleteData();
            this.toggle();
            displayApiInput((apiKey) => {
                openAI.setKey(apiKey);
                notesDatabase.saveAPIKey(apiKey);
            });
          }
          input.value = "";
        }
      });

    return section;
  }
}

export default Settings;