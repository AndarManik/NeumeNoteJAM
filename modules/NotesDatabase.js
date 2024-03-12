import instances from "./NeumeEngine.js";
class NotesDatabase {
  constructor() {
    this.dbName = "NotesDB";
    this.dbVersion = 5;
    this.db = null;
  }

  initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        this.db = event.target.result;

        if (!this.db.objectStoreNames.contains("apiKey")) {
          this.db.createObjectStore("apiKey", {
            keyPath: "id",
            autoIncrement: true,
          });
        }

        if (!this.db.objectStoreNames.contains("notesData")) {
          this.db.createObjectStore("notesData", {
            keyPath: "id",
            autoIncrement: true,
          });
        }

        if (!this.db.objectStoreNames.contains("themeData")) {
          this.db.createObjectStore("themeData", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db); // Resolve the promise with the db instance
      };

      request.onerror = (event) => {
        console.log("Database error: ", event.target.errorCode);
        reject(event.target.error); // Reject the promise with the error
      };
    });
  }

  async getNotes() {
    try {
      const transaction = this.db.transaction(["notesData"], "readonly");
      const store = transaction.objectStore("notesData");
      const request = store.get(1);

      const result = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return result.data;
    } catch (error) {
      if (error.name !== "NotFoundError") {
        console.error("IndexedDB error for Notes", error);
      }
      return null;
    }
  }

  async getAPIKey() {
    try {
      const transaction = this.db.transaction(["apiKey"], "readonly");
      const store = transaction.objectStore("apiKey");
      const request = store.get(1);

      const result = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return result.key;
    } catch (error) {
      if (error.name !== "NotFoundError") {
        console.error("IndexedDB error for ApiKey", error);
      }
      return null;
    }
  }

  async getTheme() {
    try {
      const transaction = this.db.transaction(["themeData"], "readonly");
      const store = transaction.objectStore("themeData");
      const request = store.get(1);

      const result = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return result.theme;
    } catch (error) {
      if (error.name !== "NotFoundError") {
        console.error("IndexedDB error for ApiKey", error);
      }
      return null;
    }
  }

  async saveAPIKey(apiKey) {
    const transaction = this.db.transaction(["apiKey"], "readwrite");
    const store = transaction.objectStore("apiKey");
    await transaction.done;
    store.put({ id: 1, key: apiKey });
  }

  async saveNotesData(notes) {
    const colorCounter = notes.notes.length
      ? notes.notes.reduce(
          (max, note) => (note.colorCounter > max ? note.colorCounter : max),
          notes.notes[0].colorCounter
        )
      : 0;

    notes = notes.notes.map((note) => {
      return {
        colorCounter: note.colorCounter,
        text: note.text,
        chunks: note.chunks,
        embeddings: note.embeddings,
        title: note.title,
      };
    });

    const data = { colorCounter, notes };
    const transaction = this.db.transaction(["notesData"], "readwrite");
    const store = transaction.objectStore("notesData");
    await transaction.done;
    store.put({
      id: 1,
      data,
    });
  }

  async saveThemeData(theme) {
    const transaction = this.db.transaction(["themeData"], "readwrite");
    const store = transaction.objectStore("themeData");
    await transaction.done;
    store.put({
      id: 1,
      theme,
    });
  }

  async deleteData() {
    try {
      const transaction = this.db.transaction(
        ["apiKey", "notesData"],
        "readwrite"
      );

      await Promise.all([
        transaction.objectStore("apiKey").clear(),
        transaction.objectStore("notesData").clear(),
      ]);

      await new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = (event) => reject(event.target.error);
      });

      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  
}

const notesDatabase = new NotesDatabase();
instances.notesDatabase = notesDatabase;
export default notesDatabase;
