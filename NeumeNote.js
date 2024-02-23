import notes from "./modules/Notes.js";
import openAI from "./modules/OpenAI.js";
import noteEditor from "./modules/NoteEditor.js";
import notesDatabase from "./modules/NotesDatabase.js";
import displayApiInput from "./modules/ApiKeyReader.js";
import contextListener from "./modules/ContextListener.js";
import {splitEmbed, reSplitEmbed} from "./modules/NoteChunker.js";

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

document.addEventListener("keydown", async function (e) {
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
});

async function complete() {
  const textWithSmartTag = noteEditor.getTextWithSmartTag();
  const textStream = await openAI.smartComplete(textWithSmartTag);
  await noteEditor.streamTextToNote(textStream);
}

async function search() {
  const searchText = notes.getSearchText();
  const embedding = await openAI.embed(searchText);
  notes.search(embedding);
}

async function save() {
  const data = noteEditor.cutText();
  if(data.noteIndex == -1) {
    const { texts, embeddings } = await splitEmbed(data.text);
    notes.pushNote(data.text, texts, embeddings);
    notesDatabase.saveNotesData(notes);
    return;
  }
  const { texts, embeddings } = await reSplitEmbed(data.text, data.chunks, data.embeddings);
  notes.rePushNote(data.text, texts, embeddings, data.noteIndex);
  notesDatabase.saveNotesData(notes);
}
