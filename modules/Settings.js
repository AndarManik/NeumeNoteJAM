import SettingsData from "./SettingsData.js";
import iconReader from "./IconReader.js";
class Settings {
  constructor() {
    this.settings = document.createElement("div");
    this.settings.classList.add("settings");
    this.settings.style.display = "none";
    document.body.appendChild(this.settings);
    this.settingsData = new SettingsData(this.settings, this.displayChildren.bind(this));

    this.displayChildren();
  }

  displayChildren(){
    this.settings.innerHTML = "";
    this.settings.append(this.header());
    this.settings.append(this.settingsData.getDisplay());
  }

  header() {
    const header = document.createElement("div");
    header.classList.add("settingsHeader");
    
    const leave = document.createElement("div");
    leave.classList.add("settingsLeave");
    leave.append(iconReader.newIcon("close", 16));
    leave.addEventListener("click", (e) => {
      this.settings.style.display = "none";
    });

    header.append(leave);

    return header;
  }

  toggle(){
    if(this.settings.style.display == "none"){
        this.settings.style.display = "block";
    }
    else {
        this.settings.style.display = "none"
    }
  }
}

export default Settings;