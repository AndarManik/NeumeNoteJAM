import openAI from "../OpenAI.js";
import iconReader from "../IconReader.js";
import themeEditor from "./ThemeEditor.js";
class SettingsTheme {
  constructor(settings, displayParent) {
    this.settings = settings;
    this.displayParent = displayParent;
  }
  getDisplay() {
    const section = document.createElement("div");
    section.classList.add("settingsNode");

    const header = document.createElement("div");
    header.classList.add("settingsSectionHeader");
    header.innerText = "Theme";
    section.appendChild(header);

    const info = document.createElement("div");
    info.classList.add("settingsInfo");
    section.appendChild(info);

    const text = document.createElement("div");
    text.classList.add("settingsText");
    text.innerText = `Change theme colors`;
    info.appendChild(text);

    section.addEventListener("click", (e) => {
      this.displayChildren();
    });

    return section;
  }

  displayChildren() {
    this.settings.innerHTML = "";
    this.settings.append(this.header());
    const body = document.createElement("div");
    body.classList.add("settingsBody");

    body.append(this.lightordark());
    body.append(this.setColor());
    body.append(this.setGreyScale());

    this.settings.append(body);
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

  lightordark() {
    const section = document.createElement("div");
    section.classList.add("settingsSection");

    const header = document.createElement("div");
    header.classList.add("settingsSectionHeader");
    header.innerText = "Light or Dark";
    section.appendChild(header);

    const info = document.createElement("div");
    info.classList.add("settingsInfo");
    section.appendChild(info);

    const text = document.createElement("div");
    text.classList.add("settingsText");
    text.innerText = `Choose a Light or a Dark theme.`;
    info.appendChild(text);

    const buttonSun = document.createElement("button");
    buttonSun.classList.add("settingsButton");
    buttonSun.append(iconReader.newIcon("sun", 45));
    buttonSun.addEventListener("click", e => {
        themeEditor.setLightMode();
    })
    info.append(buttonSun);

    const buttonMoon = document.createElement("button");
    buttonMoon.classList.add("settingsButton");
    buttonMoon.append(iconReader.newIcon("moon", 45));
    buttonMoon.addEventListener("click", e => {
        themeEditor.setDarkMode();
    })
    info.append(buttonMoon);

    return section;
  }

  setColor() {
    const section = document.createElement("div");
    section.classList.add("settingsSection");

    const header = document.createElement("div");
    header.classList.add("settingsSectionHeader");
    header.innerText = "Color";
    section.appendChild(header);

    const info = document.createElement("div");
    info.classList.add("settingsInfo");
    section.appendChild(info);

    const text = document.createElement("div");
    text.classList.add("settingsText");
    text.innerText = `Use the slide to select your color.`;
    info.appendChild(text);

    const colorSelector = document.createElement("input");
    colorSelector.type = "range";
    colorSelector.classList.add("slider");
    colorSelector.min = "0";
    colorSelector.max = "360";
    colorSelector.value = "0";
    colorSelector.addEventListener("input", e => {
        themeEditor.setColor(colorSelector.value);
    });
    info.append(colorSelector);

    return section;
  }

  setGreyScale() {
    const section = document.createElement("div");
    section.classList.add("settingsSection");

    const header = document.createElement("div");
    header.classList.add("settingsSectionHeader");
    header.innerText = "Grey scale";
    section.appendChild(header);

    const info = document.createElement("div");
    info.classList.add("settingsInfo");
    section.appendChild(info);

    const text = document.createElement("div");
    text.classList.add("settingsText");
    text.innerText = `Set your theme to be grey scale.`;
    info.appendChild(text);

    const buttonGrey = document.createElement("button");
    buttonGrey.classList.add("settingsButton");
    buttonGrey.append(iconReader.newIcon("eyeclosed", 45));
    buttonGrey.addEventListener("click", e => {
        themeEditor.setGreyScale();
    })
    info.append(buttonGrey);

    const buttonColor = document.createElement("button");
    buttonColor.classList.add("settingsButton");
    buttonColor.append(iconReader.newIcon("eye", 45));
    buttonColor.addEventListener("click", e => {
        themeEditor.setColorScale();
    })
    info.append(buttonColor);


    return section;
  }
}
export default SettingsTheme;
