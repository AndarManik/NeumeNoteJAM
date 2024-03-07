import { splitEmbed, reSplitEmbed } from "./NoteChunker.js";
class Note {
  constructor(colorCounter, text = "", chunks = [], embeddings = []) {
    const goldenRatio = 1.618033988749895;
    this.outerHue = 360 * ((goldenRatio * -0.09 * colorCounter) % 1);
    this.innerHue = 360 * ((goldenRatio * 0.012 * colorCounter) % 1);
    this.color =  `radial-gradient(circle, hsl(${this.outerHue}, 100%, 50%) 0%, hsl(${this.innerHue}, 100%, 50%) 100%)`;
    this.colorCounter = colorCounter;
    this.text = text;
    this.chunks = chunks;
    this.embeddings = embeddings;
    this.isProcessing = false;
  }

  async chunkText(text) {
    this.isProssing = true;
    const { texts, embeddings } = await splitEmbed(text);
    this.text = text;
    this.chunks = texts;
    this.embeddings = embeddings;
    if(!embeddings){
      alert("embedding Null");
    }
    this.isProssing = false;

  }

  async reChunkText(text) {
    this.isProssing = true;

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
        this.isProssing = false;

  }

  addRechunkAnimation(elementId) {
    const style = document.createElement('style');
    style.textContent = `
      .rechunkAnimation {
        animation: rechunkFade 3s infinite ease-in-out;
      }
  
      @keyframes rechunkFade {
        0% {
          background-color: hsl(${this.outerHue}, 100%, 97%);
        }
        50% {
          background-color: hsl(${this.innerHue}, 100%, 97%);
        }
        100% {
          background-color: hsl(${this.outerHue}, 100%, 97%);
        }
      }
    `;
    document.head.appendChild(style);
    document.getElementById(elementId).classList.add('rechunkAnimation');
  }

  addEditorAnimation(elementId) {
    const style = document.createElement('style');
    style.textContent = `
      .editorAnimation {
        animation: editorFade 3s infinite ease-in-out;
      }
  
      @keyframes editorFade {
        0% {
          background-color: hsl(${this.outerHue}, 100%, 97%);
        }
        50% {
          background-color: hsl(${this.innerHue}, 100%, 97%);
        }
        100% {
          background-color: hsl(${this.outerHue}, 100%, 97%);
        }
      }
    `;
    document.head.appendChild(style);
    document.getElementById(elementId).classList.add('editorAnimation');
  }
}

export default Note;
