import displayApiInput from "./ApiKeyReader.js";
import notesDatabase from "./NotesDatabase.js";
class OpenAI {
  constructor() {
    this.apiKey = "";
    this.model = "";
    this.completionEndpoint = "https://api.openai.com/v1/chat/completions";
    this.embeddingEndpoint = "https://api.openai.com/v1/embeddings";
    this.modelsEndpoint = "https://api.openai.com/v1/models";
    this.maxRetries = 5;
    this.waitTime = 500;
    this.validKey = false;
  }

  async initialize() {
    const apiKey = await notesDatabase.getAPIKey();
    if (apiKey) {
      await this.setKey(apiKey);
      return;
    }

    displayApiInput(async (apiKey) => {
      await this.setKey(apiKey);
      notesDatabase.saveAPIKey(apiKey);
    });

    while (!this.validKey) {
      await new Promise((resolve) => setTimeout(resolve, 125));
    }
  }

  async setKey(apiKey) {
    if (apiKey) {
      this.apiKey = apiKey;
      const response = await fetch(this.modelsEndpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        displayApiInput(async (apiKey) => {
          await this.setKey(apiKey);
          notesDatabase.saveAPIKey(apiKey);
        }, "Invalid ");
      }

      const models = await response.json();
      this.model = models.data.some(
        (model) => model.id == "gpt-4-turbo-preview"
      )
        ? "gpt-4-turbo-preview"
        : "gpt-3.5-turbo-0125";

      this.validKey = true;

      console.log(this.model);
    }
  }

  deleteData() {
    this.apiKey = "";
  }

  async autoRequest(apiCall) {
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        const result = await apiCall();
        return result;
      } catch (error) {
        retries++;
        await new Promise((resolve) =>
          setTimeout(resolve, this.waitTime * Math.pow(2, retries))
        );
        console.error(error);
      }
    }
    return null;
  }

  async titleComplete(
    prompt,
    system = `Role:
  You are a title generator for the document.
Task:
  Determine a simple title which summarizes the contents of the document provided in the users message.
Format: 
  You should only respond with the title only using alphabetic characters, do not use special characters.`
  ) {
    return this.autoRequest(async () => {
      try {
        const response = await fetch(this.completionEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Network response was not ok, status: ${response.status}`
          );
        }

        return (await response.json()).choices[0].message.content;
      } catch (error) {
        console.error("Fetch error:", error);
      }
    });
  }

  async smartComplete(
    prompt,
    context,
    system = `Role:
  You are an editor for a Markdown document. The user's message is the Markdown document.
Task:
  Determine the best text to replace the "[[SmartComplete]]". Infer the desired text based on the intructions above or around the "[[Smartomplete]]". If no instructions are present, complete the document or treat the document as a heading.
  Enhance your text by utilizing the information in the "External Context". Infer based on the user's instruction whether to incorporate information from "External Context".
Format: 
  Use markdown syntax indicators to format your text. All code indicators are available, except the \`\`\`markdown\`\`\`  indicator.
  Respond with only the text which would replace the [[SmartComplete]], for a simplified example respond with "dog's" if the document is "The man put on his [[SmartComplete]] leash before going for a walk."
  Include spaces or line breaks at the start and end if needed, for a simplified example respond with " gazelle" if the document is "The cheetah hunts the[[SmartComplete]]".

${context}
`
  ) {
    return this.autoRequest(async () => {
      try {
        const response = await fetch(this.completionEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: prompt },
            ],
            stream: true,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Network response was not ok, status: ${response.status}`
          );
        }

        return this.streamTextLines(response.body);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    });
  }

  async smartReplace(
    prompt,
    context,
    system = `Role:
  You are an editor for a Markdown document. The user's message is the Markdown document.
Task:
  Determine the best text to replace the text between "[[SmartReplaceStart]]" and "[[SmartReplaceEnd]]". Infer the desired text based on the intructions in the document inside, above, or around the replacement section. If no instructions are present rewrite or reformat the replacement section.
  Enhance your text by utilizing the information in the "External Context". Infer based on the user's instruction whether to incorporate information from "External Context".
Format: 
  Use markdown syntax indicators to format your text. All code indicators are available, except the \`\`\`markdown\`\`\` indicator.
  Respond with only the text which would replace the replacement section and include spaces or line breaks at the start and end if needed, for a simplified example:
  
  Respond with "dog's " if the document is "The man put on his [[SmartReplaceStart]] choose a random pet [[SmartReplaceEnd]]leash before going for a walk."

${context}
`
  ) {
    return this.autoRequest(async () => {
      try {
        const response = await fetch(this.completionEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: prompt },
            ],
            stream: true,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Network response was not ok, status: ${response.status}`
          );
        }

        return this.streamTextLines(response.body);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    });
  }

  async partition(
    prompt,
    system = `Task:
  Identify unique delimiters within a user's message, enabling the segmentation of the message into distinct parts. Each segment should encapsulate a single idea, concept, or entity.
    
Requirements:
  Delimiters should be extracted from the end of each segment.
  Use several consecutive words as delimiters to ensure a single occurrence within the message. Use up to five words.
  The output should be formatted as a JSON object with a single key delimiters, associated with a list of identified delimiters.
    
Example: 
  Given the message "If dogs are mammals, then dogs breathe air. The sun is a star.", an appropriate output would be 
  {"delimiters": ["dogs breath air.", "a star."]}.
    
Format: 
  The result should be a JSON object that lists the identified delimiters.`
  ) {
    return this.autoRequest(async () => {
      const completion = await fetch(this.completionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-0125",
          messages: [
            { role: "system", content: `${system}` },
            { role: "user", content: `${prompt}` },
          ],
          response_format: { type: "json_object" },
          presence_penalty: -1,
        }),
      });

      return JSON.parse((await completion.json()).choices[0].message.content);
    });
  }

  async embed(text) {
    return this.autoRequest(async () => {
      const embedding = await fetch(this.embeddingEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text,
        }),
      });
      return (await embedding.json()).data[0].embedding;
    });
  }

  async embedBatch(texts) {
    return this.autoRequest(async () => {
      const embeddings = await fetch(this.embeddingEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: texts,
        }),
      });
      return (await embeddings.json()).data.map((data) => data.embedding);
    });
  }

  // smelly way to turn the stream calls into async iterables
  async *streamTextLines(textStream) {
    const reader = textStream.getReader();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunkText = new TextDecoder().decode(value, { stream: true });
        buffer += chunkText;

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line.startsWith("data: ")) {
            if (line === "data: [DONE]") {
              return;
            }
            const jsonData = JSON.parse(line.substring(6));
            if (
              jsonData.choices &&
              jsonData.choices.length > 0 &&
              jsonData.choices[0].delta.content !== undefined
            ) {
              yield jsonData.choices[0].delta.content;
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream processing error:", error);
    } finally {
      reader.releaseLock();
    }
  }
}

const openAI = new OpenAI();
export default openAI;
