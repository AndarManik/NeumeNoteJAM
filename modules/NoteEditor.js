class NoteEditor {
  constructor() {
    this.textAfterCursor = "";
    this.textBeforeCursor = "";
    this.isCompleteing = false;
  }

  cutText() {
    const text = document.getElementById("completeSection").value;
    document.getElementById("completeSection").value = "";
    return text;
  }

  getTextWithSmartTag() {
    this.isCompleteing = true;
    const completeSection = document.getElementById("completeSection");
    const text = completeSection.value;
    const cursorPosition = completeSection.selectionStart;
    this.textBeforeCursor = text.substring(0, cursorPosition);
    this.textAfterCursor = text.substring(cursorPosition);
    const textWithSmartTag =
      this.textBeforeCursor + "[[Smart Complete]]" + this.textAfterCursor;
    return textWithSmartTag;
  }

  hasText() {
    const text = document.getElementById("completeSection").value;
    return Boolean(text);
  }

  async streamTextToNote(textStream) {
    const completeSection = document.getElementById("completeSection");
    const reader = textStream.getReader();
    let buffer = '';
  
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream completed.");
          break;
        }
  
        // Convert the chunk from Uint8Array to a string
        const chunkText = new TextDecoder().decode(value, { stream: true });
        buffer += chunkText;
  
        // Process each line as it's complete
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
  
          if (line.startsWith('data: ')) {
            if(line === "data: [DONE]") {
              break;
            }
            const jsonData = JSON.parse(line.substring(6)); // Remove 'data: ' prefix and parse JSON
            if (jsonData.choices && jsonData.choices.length > 0 && jsonData.choices[0].delta.content !== undefined) {
              this.textBeforeCursor += jsonData.choices[0].delta.content;
              completeSection.value = this.textBeforeCursor + this.textAfterCursor; // Append the content to the textarea
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream processing error:', error);
    } finally {
      reader.releaseLock();
      this.isCompleteing = false;
    }
  }
}

const noteEditor = new NoteEditor();
export default noteEditor;
