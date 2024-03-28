import notes from "../Notes.js";
import themeEditor from "./ThemeEditor.js";
import notesDatabase from "../NotesDatabase.js";
import chunkViewer from "../ChunkViewer.js";
import graphViewer from "../GraphViewer.js";
class DataFileHandler {
  getNotesZip() {
    var zip = new JSZip();
    // Loop through the array of strings
    const dataToSave = {};

    dataToSave.notes = notes.notes.map((note) => {
      return {
        colorCounter: note.colorCounter,
        text: note.text,
        title: note.title,
        chunks: note.chunks,
        embeddings: note.embeddings,
      };
    });

    dataToSave.theme = themeEditor.getTheme();
    zip.file("data.txt", JSON.stringify(dataToSave));

    notes.notes.forEach((note) => {
      const title = note.title + ".txt";
      const text = note.chunks.reduce((acc, value) => acc + value, "");
      zip.file(title, text);
    });

    // Generate the zip file and trigger a download
    zip.generateAsync({ type: "blob" }).then((content) => {
      this.downloadFile(content, "notes.zip");
    });
  }

  downloadFile(text, fileName) {
    const blob = new Blob([text], { type: "application/zip" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  loadNotesZip(file) {
    let reader = new FileReader();
    reader.onload = async (event) => {
      let textFromFile = event.target.result;
      const data = JSON.parse(textFromFile);
      console.log(data);
      notes.loadNewData(data.notes);
      themeEditor.setTheme(data.theme);
      chunkViewer.reInitialize();
      await notesDatabase.saveNotesData(notes);
      await notesDatabase.saveThemeData(themeEditor.getTheme());
      graphViewer.handleNoteChange();
    };
    reader.readAsText(file);
  }
}
const dataFileHandler = new DataFileHandler();
export default dataFileHandler;
