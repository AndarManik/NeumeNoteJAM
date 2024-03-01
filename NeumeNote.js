import notes from "./modules/Notes.js";
import openAI from "./modules/OpenAI.js";
import noteEditor from "./modules/NoteEditor.js";
import notesDatabase from "./modules/NotesDatabase.js";
import HeaderUtility from "./modules/HeaderUtility.js";
import displayApiInput from "./modules/ApiKeyReader.js";
import contextListener from "./modules/ContextListener.js";


contextListener.setListener();
notesDatabase.initializeDB().then(async () => {
  notes.setData(await notesDatabase.getNotes());

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

notes.linkEditor(noteEditor);

new HeaderUtility();

document.addEventListener("keydown", async function (e) {
  if(!openAI.apiKey){
    return;
  }
  const shiftEnterPressed = e.shiftKey && e.code === "Enter";
  const controlSPressed = e.ctrlKey && e.code === "KeyS";
  const completeAvailable =
    contextListener.isCompleteActive && !noteEditor.isCompleteing;
  const searchAvailable =
    contextListener.isSearchInputActive && !notes.isSearching;

  if (shiftEnterPressed && completeAvailable) {
    e.preventDefault();
    await complete();
  }

  if (shiftEnterPressed && searchAvailable) {
    e.preventDefault();
    await search();
  }

  if (controlSPressed && noteEditor.hasText()) {
    e.preventDefault();
    await save();
  }

  if(e.code === "Tab" && completeAvailable) {
    e.preventDefault();
    console.log("tab");
    noteEditor.insertTab();
  }
});

async function complete() {
  const textWithSmartTag = noteEditor.getTextWithSmartTag();
  const textStream = await openAI.smartComplete(textWithSmartTag);
  if(!textStream) {
    noteEditor.setIsCompleting(false);
    return;
  }
  await noteEditor.streamTextToNote(textStream);
}

async function search() {
  const searchText = notes.getSearchText();
  const embedding = await openAI.embed(searchText);
  notes.search(embedding);
}

//TODO: add some buffering here so that the user can save multiple text quickly without breaking this, since it's async.
async function save() {
  const data = noteEditor.cutText();
  if(data.noteIndex == -1) {
    await notes.pushNote(data.text);
    notesDatabase.saveNotesData(notes);
    return;
  }
  await notes.rePushNote(data.text, data.noteIndex);
  notesDatabase.saveNotesData(notes);
}
