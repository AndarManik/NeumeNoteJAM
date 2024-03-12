import instances from "./NeumeEngine.js";
class IconReader {
  constructor() {
  }

  newIcon(name, size){
    const clone = this[name].cloneNode(true);
    clone.style.width = size + "px";
    clone.style.height = size + "px";
    return clone;
  }

  async initialize(){
    this.folderPath = "/Icons";
    
    try {
      await this.fetchSvg("pencil-r.svg");
    }
    catch (e) {
      this.folderPath = "/NeumeNoteJam/Icons"
    }

    this.pencil = await this.fetchSvg("pencil-r.svg");
    this.refresh = await this.fetchSvg("refresh-r.svg");
    this.trash = await this.fetchSvg("trash-r.svg");
    this.chevronLeft = await this.fetchSvg("chevron-left-r.svg");
    this.chevronRight = await this.fetchSvg("chevron-right-r.svg");
    this.search = await this.fetchSvg("search-r.svg");
    this.file = await this.fetchSvg("file-r.svg");
    this.stack = await this.fetchSvg("stack-r.svg");
    this.backspace = await this.fetchSvg("backspace-r.svg");
    this.close = await this.fetchSvg("close-r.svg");
    this.moon = await this.fetchSvg("moon-r.svg");
    this.sun = await this.fetchSvg("sun-r.svg");
    this.eye = await this.fetchSvg("eye-r.svg");
    this.eyeclosed = await this.fetchSvg("eye-closed-r.svg");
  }
  

  async fetchSvg(fileName) {
    try {
      const response = await fetch(`${this.folderPath}/${fileName}`);
      var data = await response.text();
      data = data.replace(/<script.*?<\/script>/gs, '');
      data = data.replace(/(<!--.*?-->)/gs, '');
      data = data.replace(/fill=".*?"/g, 'fill="var(--text)"');
      return new DOMParser().parseFromString(data, "image/svg+xml")
        .documentElement;
    } catch (error) {
      console.error("Failed to fetch SVG:", error);
    }
  }

}
const iconReader = new IconReader();
instances.iconReader = iconReader;

export default iconReader;
