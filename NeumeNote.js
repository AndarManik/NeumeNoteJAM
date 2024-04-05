import notes from "./modules/Notes.js";
import openAI from "./modules/OpenAI.js";
import noteEditor from "./modules/NoteEditor.js";
import notesDatabase from "./modules/NotesDatabase.js";
import contextBuilder from "./modules/ContextBuilder.js";
import chunkViewer from "./modules/ChunkViewer.js";
import iconReader from "./modules/IconReader.js";
import leftUtility from "./modules/LeftUtility.js";
import themeEditor from "./modules/settingscomponents/ThemeEditor.js";
import graphViewer from "./modules/GraphViewer.js";

/*
  Asyncrounous initialization
  NotesDB and icons need to be preloaded to reduce the coloring from async
  openAI, notes, and ThemeEditor need information from NotesDB
  These other modules need the icon reader
*/
(async function () {
  await Promise.all([notesDatabase.initialize(), iconReader.initialize()]);
  await themeEditor.initialize();
  await Promise.all([
    openAI.initialize(),
    notes.initialize(),
  ]);
  noteEditor.initialize()
  leftUtility.initialize();
  chunkViewer.initialize();
  contextBuilder.initialize();
  graphViewer.initialize();

  window.addEventListener("beforeunload", saveDatabase());

  setInterval(async () => {
    await saveDatabase();
  }, 15000);
})();

async function saveDatabase() {
  await notes.finishedProcessing();
  await Promise.all([
    notesDatabase.saveNotesData(notes),
    notesDatabase.saveAPIKey(openAI.apiKey),
    notesDatabase.saveThemeData(themeEditor.getTheme()),
  ]);
}
