class NotesDatabase {
  constructor() {
    this.dbName = "NotesDB";
    this.dbVersion = 4;
    this.db = null;
  }

  initializeDB() {
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
          const notesStore = this.db.createObjectStore("notesData", {
            keyPath: "id",
            autoIncrement: true,
          });
          notesStore.createIndex("notes", "notes", { unique: false });
          notesStore.createIndex("chunks", "chunks", { unique: false });
          notesStore.createIndex("embeddings", "embeddings", { unique: false });
          notesStore.createIndex("chunk2note", "chunk2note", { unique: false });
          notesStore.createIndex("note2chunk", "note2chunk", { unique: false });
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

      return result;
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

  saveAPIKey(apiKey) {
    const transaction = this.db.transaction(["apiKey"], "readwrite");
    const store = transaction.objectStore("apiKey");
    store.put({ id: 1, key: apiKey });
  }

  saveNotesData(data) {
    console.log(data);
    const {notes, chunks, embeddings, chunk2note, note2chunk} = data;
    console.log({notes, chunks, embeddings, chunk2note, note2chunk});
    const transaction = this.db.transaction(["notesData"], "readwrite");
    const store = transaction.objectStore("notesData");
    store.put({
      id: 1,
      notes: notes,
      chunks: chunks,
      embeddings: embeddings,
      chunk2note: chunk2note,
      note2chunk: note2chunk,
    });
  }

  async deleteData() {
    try {
      const transaction = this.db.transaction(["apiKey", "notesData"], "readwrite");
  
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
export default notesDatabase;
