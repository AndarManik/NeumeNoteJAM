import notes from "./modules/Notes.js";
import openAI from "./modules/OpenAI.js";
import noteEditor from "./modules/NoteEditor.js";
import splitEmbed from "./modules/NoteChunker.js";
import notesDatabase from "./modules/NotesDatabase.js";
import contextListener from "./modules/ContextListener.js";

contextListener.setListener();
notesDatabase.initializeDB().then(async () => {
  notes.setData(await notesDatabase.getNotes());
  const apiKey = await notesDatabase.getAPIKey();
  if (apiKey) {
    openAI.setKey(apiKey);
    return;
  }

  const apiInputContainer = document.createElement("div");
  apiInputContainer.classList.add("apiInputContainer");
  apiInputContainer.textContent = "Paste your OpenAI API key";

  const apiInput = document.createElement("input");
  apiInput.classList.add("apiInput");
  apiInputContainer.appendChild(apiInput);

  document.body.appendChild(apiInputContainer);

  apiInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      openAI.setKey(apiInput.value);
      notesDatabase.saveAPIKey(apiInput.value);

      document.body.removeChild(apiInputContainer);
    }
  });
});

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
  const text = noteEditor.cutText();
  notes.pushNote(text);
  const {texts, embeddings} = await splitEmbed(text);
  notes.pushChunks(texts, embeddings);
}
