import Settings from "./Settings.js";
class HeaderUtility {
    constructor(){
        this.settings = new Settings();
        const settings = document.createElement("div");
        settings.classList.add("headerButton");
        settings.innerText = "Settings";
        settings.addEventListener("click" , e => this.toggleSettings());

        document.getElementById("leftHeader").append(settings);

        const toggleSearch = document.createElement("div");
        toggleSearch.classList.add("headerButton");
        toggleSearch.innerText = "Toggle Search";
        toggleSearch.addEventListener("click" , e => this.toggleSearch());
        document.getElementById("leftHeader").append(toggleSearch);

        const toggleContext = document.createElement("div");
        toggleContext.classList.add("headerButton");
        toggleContext.innerText = "Toggle Context";
        toggleContext.addEventListener("click" , e => this.toggleContext());
        document.getElementById("leftHeader").append(toggleContext);
    }

    toggleSettings(){
        this.settings.toggle();
    }

    toggleSearch(){
        const leftSection = document.getElementById("leftSection");

        if(leftSection.style.display == "none") {
            leftSection.style.display = "flex";
        }
        else{
            leftSection.style.display = "none";
        }
    }

    toggleContext(){
        const contextBuilder = document.getElementById("contextBuilder");
        if(!contextBuilder){
            return;
        }
        if(contextBuilder.style.display == "none") {
            contextBuilder.style.display = "flex";
        }
        else{
            contextBuilder.style.display = "none";
        }
    }
}

export default HeaderUtility;