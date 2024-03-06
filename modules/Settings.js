import SettingsData from "./SettingsData.js";

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
    this.settings.append(this.settingsData.getDisplay());
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