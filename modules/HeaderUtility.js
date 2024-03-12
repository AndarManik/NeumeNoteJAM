import Settings from "./Settings.js";
class HeaderUtility {
    constructor(){
        const settings = document.createElement("div");
        settings.classList.add("headerButton");
        settings.innerText = "Settings";
        settings.addEventListener("click" , e => this.toggleSettings());

        document.getElementById("header").append(settings);
    }

    initialize() {
        this.settings = new Settings();
    }

    toggleSettings(){
        this.settings.toggle();
    }
}
const headerUtility = new HeaderUtility();

export default headerUtility;