class IconReader {

  newIcon(name, size){
    const clone = this[name].cloneNode(true);
    clone.style.width = size + "px";
    clone.style.height = size + "px";
    return clone;
  }

  async initialize(){
    this.folderPath = "/Icons";

    const test = await this.fetchSvg("pencil-r.svg")

    console.log(test);
    if(!test) {
      this.folderPath = "/NeumeNoteJAM/Icons"
    }

    this.logo = await this.fetchSvg("logo.svg");
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
    this.sitemap = await this.fetchSvg("sitemap-r.svg");
    this.download = await this.fetchSvg("download-r.svg");
    this.upload = await this.fetchSvg("upload-r.svg");

  }
  

  async fetchSvg(fileName) {
    try {
      const response = await fetch(`${this.folderPath}/${fileName}`);
      var data = await response.text();
      data = data.replace(/<script.*?<\/script>/gs, '');
      data = data.replace(/(<!--.*?-->)/gs, '');
      data = data.replace(/fill=".*?"/g, 'fill="var(--text)"');
      const doc = new DOMParser().parseFromString(data, "image/svg+xml");
      if (doc.documentElement.getElementsByTagName("parsererror").length > 0) {
        return null; 
      }
      return doc.documentElement;
    } catch (error) {
      return null;
    }
  }

}
const iconReader = new IconReader();

export default iconReader;
