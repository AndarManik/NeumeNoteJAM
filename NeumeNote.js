import notes from "./modules/Notes.js";
import openAI from "./modules/OpenAI.js";
import noteEditor from "./modules/NoteEditor.js";
import notesDatabase from "./modules/NotesDatabase.js";
import contextBuilder from "./modules/ContextBuilder.js";
import headerUtility from "./modules/HeaderUtility.js";
import chunkViewer from "./modules/ChunkViewer.js";
import iconReader from "./modules/IconReader.js";

notesDatabase.initialize().then(async () => {
  await iconReader.initialize();
  await notes.initialize();
  await openAI.initialize();
  while (!openAI.validKey) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  window.addEventListener("beforeunload", async (e) => {
    await notes.finishedProcessing();
    await notesDatabase.saveNotesData(notes);
    await notesDatabase.saveAPIKey(openAI.apiKey);
  });
  noteEditor.initialize();
});

document.addEventListener("keydown", async function (e) {
  if (!openAI.apiKey) {
    return;
  }
  const shiftEnterPressed = e.shiftKey && e.code === "Enter";
  if (shiftEnterPressed && noteEditor.canComplete()) {
    e.preventDefault();
    await complete();
  }

  if (shiftEnterPressed && notes.canSearch()) {
    e.preventDefault();
    await search();
  }

  if (e.code === "Escape") {
    e.preventDefault();

    noteEditor.stopComplete();
  }

  if (e.ctrlKey && e.code === "KeyS") {
    e.preventDefault();
    if (noteEditor.hasText()) {
      await save();
    }
  }

  if (e.code === "Tab" && noteEditor.canComplete()) {
    e.preventDefault();
    console.log("tab");
    noteEditor.insertTab();
  }
});

async function complete() {
  const textWithSmartTag = noteEditor.getTextWithSmartTag();
  const textStream = await openAI.smartComplete(textWithSmartTag);
  if (!textStream) {
    noteEditor.streamFailed();
    return;
  }
  noteEditor.streamTextToTab(textStream);
}

async function search() {
  const searchText = notes.getSearchText();
  const embedding = await openAI.embed(searchText);
  notes.search(embedding);
}

async function save() {
  const { note, type } = await noteEditor.saveText();
  if (type == "new") {
    notes.addNote(note);
  } else {
    notes.updateNote(note);
  }
}
