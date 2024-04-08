import { splitEmbed, reSplitEmbed } from "./NoteChunker.js";
import openAI from "./OpenAI.js";
import themeEditor from "./settingscomponents/ThemeEditor.js";
class Note {
  constructor(colorCounter,text = "", chunks = [], embeddings = [], title = "") {
    const goldenRatio = 1.618033988749895;
    this.outerHue = 360 * (((goldenRatio / 10) * colorCounter) % 1);
    this.innerHue = 360 * (((goldenRatio / 10 / 5) * colorCounter) % 1);
    this.colorCounter = colorCounter;
    this.text = text;
    this.chunks = chunks;
    this.embeddings = embeddings;
    this.title = title;
    this.isProcessing = false;
  }

  getColor(){
    if(themeEditor.state == "light"){
      return `radial-gradient(circle, hsl(${this.outerHue}, 100%, 66%) 0%, hsl(${this.innerHue}, 100%, 66%) 100%)`;
    }
    else {
      return `radial-gradient(circle, hsl(${this.outerHue}, 85%, 66%) 0%, hsl(${this.innerHue}, 85%, 66%) 100%)`;
    }
  }

  async chunkText(text) {
    this.isProcessing = true;

    var titlePromise;
    if(!this.title) {
      titlePromise = this.setTitle(text);
    }

    const { texts, embeddings } = await splitEmbed(text);
    this.text = text;
    this.chunks = texts;
    this.embeddings = embeddings;
    if(!embeddings){
      alert("embedding Null");
    }
    await titlePromise;
    this.isProcessing = false;
  }

  async setTitle(text) {
    this.title = await openAI.titleComplete(text);
  }

  async reChunkText(text) {
    this.isProcessing = true;

    const { texts, embeddings } = await reSplitEmbed(
      text,
      this.chunks,
      this.embeddings
    );
    this.text = text;
    this.chunks = texts;
    this.embeddings = embeddings;

    if(!embeddings){
      alert("embedding Null");
    }
        this.isProcessing = false;
  }

  addRechunkAnimation(elementId) {
    const searchColor = getComputedStyle(document.documentElement).getPropertyValue('--search');
    var [hue, saturation, lightness] = searchColor.match(/\d+/g);
    saturation = Math.max(saturation, 5);
    const style = document.createElement('style');
    style.textContent = `
      .rechunkAnimation {
        animation: rechunkFade 3s infinite ease-in-out;
      }
  
      @keyframes rechunkFade {
        0% {
          background-color: hsl(${this.outerHue}, ${saturation}%, ${lightness}%);
        }
        50% {
          background-color: hsl(${this.innerHue}, ${saturation}%, ${lightness}%);
        }
        100% {
          background-color: hsl(${this.outerHue}, ${saturation}%, ${lightness}%);
        }
      }
    `;
    document.head.appendChild(style);
    document.getElementById(elementId).classList.add('rechunkAnimation');
  }

  addEditorAnimation(element) {
    const editorColor = getComputedStyle(document.documentElement).getPropertyValue('--editor');
    var [hue, saturation, lightness] = editorColor.match(/\d+/g);
    saturation = Math.max(saturation, 5);

    const style = document.createElement('style');
    style.textContent = `
      .editorAnimation {
        animation: editorFade 3s infinite ease-in-out;
      }
  
      @keyframes editorFade {
        0% {
          background: hsl(${this.outerHue}, ${saturation}%, ${lightness}%);
        }
        50% {
          background: hsl(${this.innerHue}, ${saturation}%, ${lightness}%);
        }
        100% {
          background: hsl(${this.outerHue}, ${saturation}%, ${lightness}%);
        }
      }
    `;
    document.head.appendChild(style);
    element.classList.add('editorAnimation');
  }
}

export default Note;
