import notes from "./modules/Notes.js";
import openAI from "./modules/OpenAI.js";
import noteEditor from "./modules/NoteEditor.js";
import notesDatabase from "./modules/NotesDatabase.js";
import contextBuilder from "./modules/ContextBuilder.js";
import headerUtility from "./modules/HeaderUtility.js";
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
  await Promise.all([openAI.initialize(), notes.initialize()]);

  noteEditor.initialize();
  headerUtility.initialize();
  leftUtility.initialize();
  chunkViewer.initialize();
  contextBuilder.initialize();
  graphViewer.initialize();

  window.addEventListener("beforeunload", async (e) => {
    await notes.finishedProcessing();
    await notesDatabase.saveNotesData(notes);
    await notesDatabase.saveAPIKey(openAI.apiKey);
    await notesDatabase.saveThemeData(themeEditor.getTheme());
  });
})();
