import SettingsData from "./SettingsData.js";
import SettingsTheme from "./SettingsTheme.js";
import iconReader from "../IconReader.js";
class Settings {
  constructor() {
    this.settings = document.createElement("div");
    this.settings.classList.add("settings");
    this.settings.style.display = "none";
    document.body.appendChild(this.settings);
    this.settingsData = new SettingsData(this.settings, this.displayChildren.bind(this));
    this.settingsTheme = new SettingsTheme(this.settings, this.displayChildren.bind(this))
    this.displayChildren();
  }

  displayChildren(){
    this.settings.innerHTML = "";
    this.settings.append(this.header());
    
    
    const body = document.createElement("div");
    body.classList.add("settingsBody");

    body.append(this.settingsData.getDisplay());
    body.append(this.settingsTheme.getDisplay());

    this.settings.append(body);
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