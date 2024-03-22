import Settings from "./settingscomponents/Settings.js";
import iconReader from "./IconReader.js";
class HeaderUtility {
    initialize() {
        const logo = document.createElement("div");
        logo.append(iconReader.newIcon("logo", 22));
        logo.style.margin = "7px";
        //document.getElementById("header").append(logo);


        const settings = document.createElement("div");
        settings.classList.add("headerButton");
        settings.innerText = "Settings";
        settings.addEventListener("click" , e => this.toggleSettings());

        document.getElementById("header").append(settings);
        this.settings = new Settings();
    }

    toggleSettings(){
        this.settings.toggle();
    }
}
const headerUtility = new HeaderUtility();

export default headerUtility;