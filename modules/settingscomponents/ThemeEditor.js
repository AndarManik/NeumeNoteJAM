import graphViewer from "../GraphViewer.js";
import notesDatabase from "../NotesDatabase.js";
import setEditorStyle from "../SimpleMDEStyle.js";
class ThemeEditor {
  async initialize() {
    const themes = await notesDatabase.getTheme();
    console.log(themes);
    if(!themes) {
        this.setLightMode();
        this.setColor(240);
        return;
    }
    this.setColor(themes.hue);

    if(themes.state == "dark") {
        this.setDarkMode();
    }
    else {
        this.setLightMode();
    }

    if(themes.monochrome) {
        this.setGreyScale();
    }
  }

  setLightMode() {
    this.state = "light";
    const root = document.documentElement;
    const properties = [
      "--editor",
      "--search",
      "--left",
      "--text",
      "--highlight",
      "--active",
    ];
    const lightnesses = [84, 88, 91, 7, 76, 70];
    const saturations = [15, 12, 15, 0, 9, 9];
    properties.forEach((property, index) => {
      const style = getComputedStyle(root).getPropertyValue(property);
      const hsl = style.match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
      const lightness = lightnesses[index];
      const saturation = saturations[index];
      root.style.setProperty(
        property,
        `hsl(${hsl[1]}, ${saturation}%, ${lightness}%)`
      );
    });
    setEditorStyle();
    graphViewer.handleStyleChange();
  }

  setDarkMode() {
    this.state = "dark";
    const root = document.documentElement;
    const properties = [
      "--editor",
      "--search",
      "--left",
      "--text",
      "--highlight",
      "--active",
    ];
    const lightnesses = [16, 12, 9, 93, 24, 30];
    const saturations = [9, 8, 9, 0, 6, 6];
    properties.forEach((property, index) => {
      const style = getComputedStyle(root).getPropertyValue(property);
      const hsl = style.match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
      const lightness = lightnesses[index];
      const saturation = saturations[index];
      root.style.setProperty(
        property,
        `hsl(${hsl[1]}, ${saturation}%, ${lightness}%)`
      );
    });
    setEditorStyle();
    graphViewer.handleStyleChange();
  }

  setColor(hue) {
    this.hue = hue;
    this.setColorScale();
    const root = document.documentElement;
    const properties = [
      "--editor",
      "--search",
      "--left",
      "--text",
      "--highlight",
      "--active",
    ];
    properties.forEach((property) => {
      const style = getComputedStyle(root).getPropertyValue(property);
      const hsl = style.match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
      root.style.setProperty(property, `hsl(${hue}, ${hsl[2]}%, ${hsl[3]}%)`);
    });
    setEditorStyle();
  }

  setGreyScale(){
    this.monochrome = true;
    const root = document.documentElement;
    const properties = [
      "--editor",
      "--search",
      "--left",
      "--text",
      "--highlight",
      "--active",
    ];
    properties.forEach((property) => {
      const style = getComputedStyle(root).getPropertyValue(property);
      const hsl = style.match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
      root.style.setProperty(property, `hsl(${hsl[1]}, ${0}%, ${hsl[3]}%)`);
    });
    setEditorStyle();
  }

  setColorScale(){
    this.monochrome = false;
    if(this.state == "light") {
        this.setLightMode();
    }
    else{
        this.setDarkMode();
    }
    setEditorStyle();
  }

  getTheme() {
    const theme = {hue: this.hue, state: this.state, monochrome: this.monochrome};
    
    return theme;
  }

  setTheme(data){
    this.state = data.state;
    this.setColorScale();

    if(data.monochrome){
      this.setGreyScale();
    }
    else {
      this.setColor(data.hue);
    }
    setEditorStyle();

  }

  getBoldColor() {
    return `hsl(${this.hue}, ${100}%, ${((this.state == "light") ? 40 : 80 )}%)`
  }
}

const themeEditor = new ThemeEditor();

export default themeEditor;
