import notes from "./modules/Notes.js";
import openAI from "./modules/OpenAI.js";
import noteEditor from "./modules/NoteEditor.js";
import notesDatabase from "./modules/NotesDatabase.js";
import HeaderUtility from "./modules/HeaderUtility.js";
import displayApiInput from "./modules/ApiKeyReader.js";
import contextListener from "./modules/ContextListener.js";

new HeaderUtility();
contextListener.setListener();

notesDatabase.initializeDB().then(async () => {
  notes.setData(await notesDatabase.getNotes());
  notes.linkEditor(noteEditor);
  const apiKey = await notesDatabase.getAPIKey();
  if (apiKey) {
    openAI.setKey(apiKey);
    return;
  }

  displayApiInput((apiKey) => {
    openAI.setKey(apiKey);
    notesDatabase.saveAPIKey(apiKey);
  });
});

window.addEventListener("beforeunload", async (e) => {
  await notes.finishedProcessing();
  await notesDatabase.saveNotesData(notes);
});

document.addEventListener("keydown", async function (e) {
  if (!openAI.apiKey) {
    return;
  }
  const shiftEnterPressed = e.shiftKey && e.code === "Enter";
  const controlSPressed = e.ctrlKey && e.code === "KeyS";
  const completeAvailable =
    contextListener.isCompleteActive && noteEditor.canComplete();
  const searchAvailable =
    contextListener.isSearchInputActive && !notes.isSearching;
  const escapePressed = e.code === "Escape";
  if (shiftEnterPressed && completeAvailable) {
    e.preventDefault();
    await complete();
  }

  if (shiftEnterPressed && searchAvailable) {
    e.preventDefault();
    await search();
  }

  if (escapePressed) {
    noteEditor.stopComplete()
  }

  if (controlSPressed) {
    e.preventDefault();
    if (noteEditor.hasText()) {
      await save();
    }
  }

  if (e.code === "Tab" && completeAvailable) {
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

//TODO: add some buffering here so that the user can save multiple text quickly without breaking this, since it's async.
async function save() {
  const { note, type } = await noteEditor.saveText();
  if (type == "new") {
    notes.addNote(note);
  } else {
    notes.updateNote(note);
  }
}
