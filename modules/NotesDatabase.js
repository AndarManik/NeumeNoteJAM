class NotesDatabase {
  constructor() {
    this.dbName = "NotesDB";
    this.dbVersion = 5;
    this.db = null;
  }

  async initialize() {
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

    await new Promise((resolve, reject) => {
      request.onsuccess = async (event) => {
        this.db = event.target.result;
        resolve(); // Previously resolved with this.db, now resolved with no value
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
      const request = store.getAll();

      const results = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return results || [];
    } catch (error) {
      console.error("IndexedDB error for Notes", error);
      return [];
    }
  }

  async saveNotes(notes) {
    const transaction = this.db.transaction(["notesData"], "readwrite");
    const store = transaction.objectStore("notesData");
  
    const allPromises = notes.map(note => {
      const data = {
        colorCounter: note.colorCounter,
        text: note.text,
        chunks: note.chunks,
        embeddings: note.embeddings,
        title: note.title,
      };
  
      const request = store.put({ id: note.colorCounter, data });
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  
    await Promise.all(allPromises);
  
    await transaction.done;
  }

  
  async saveNote(note){
    const data = {
      colorCounter: note.colorCounter,
      text: note.text,
      chunks: note.chunks,
      embeddings: note.embeddings,
      title: note.title,
    };
    const transaction = this.db.transaction(["notesData"], "readwrite");
    const store = transaction.objectStore("notesData");
  
    // Assuming note.id is the unique identifier for each note.
    const request = store.put({ id: note.colorCounter, data });
  
    await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  
    await transaction.done;
  }

  async deleteNote(colorCounter) {
    const transaction = this.db.transaction(["notesData"], "readwrite");
    const store = transaction.objectStore("notesData");
    const request = store.delete(colorCounter);
  
    await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  
    await transaction.done;
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

   async saveAPIKey(apiKey) {
    const transaction = this.db.transaction(["apiKey"], "readwrite");
    const store = transaction.objectStore("apiKey");
    store.put({ id: 1, key: apiKey });
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

  async saveTheme(theme) {
    const transaction = this.db.transaction(["themeData"], "readwrite");
    const store = transaction.objectStore("themeData");
    store.put({
      id: 1,
      theme,
    });
  }


  async deleteData() {
    try {
      const transaction = this.db.transaction(
        ["apiKey", "notesData", "themeData"],
        "readwrite"
      );

      await Promise.all([
        transaction.objectStore("apiKey").clear(),
        transaction.objectStore("notesData").clear(),
        transaction.objectStore("themeData").clear(),
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
