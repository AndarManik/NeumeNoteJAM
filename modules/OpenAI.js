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
    system = `Role:
  You are a text segmenter for a Markdown document. The purpose of this segmentation is to aid the search of information within the document.
Task:
  Identify unique delimiters within the user's message to define the segmentation of the message into distinct segments. Each segment should encapsulate a single idea, concept, or entity.
    
Requirements:
  Delimiters should be extracted from the end of each segment.
  Use several consecutive words as delimiters to ensure a single occurrence within the message. Use up to five words.
     
Format: 
  The output should be formatted as a JSON object with a single key "delimiters", associated with a list of identified delimiters.

Example: 
  Given the message "If dogs are mammals, then dogs breathe air. The sun is a star.", an appropriate output would be 
  {"delimiters": ["dogs breath air.", "a star."]}.
`
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
        }),
      });

      return JSON.parse((await completion.json()).choices[0].message.content);
    });
  }

  async split(
    prompt,
    system = `Role:
  You are a text splitter for a Markdown document.
Task:
  You will be provided with a document which may be split into two section. 
  This split is where the document changes topic.
  If there is more than one change in topic, then split on the first topic change.
  Define this split using a unique delimiter string.
Requirements:
  Provide an explanation, a delimiter, and a confidence score in a JSON.
  
  The explanation should provide a reason for the choosen delimiter.
  Use a single sentence for the explanation.

  The delimiter should be extracted from the begginning of the second section.
  Use several consecutive words as a delimiter to ensure a single occurrence within the message. Use up to five words.  

  The confidence score should be a value between 0 and 1, near zero means the text should not be split and near one means the text should be split.

Output Examples:
  1.
    Input: "If **dogs** are mammals, then **dogs** breathe air.\n- The sun is a **star**. **Stars** are plasma."
    Output: {"explanation": "The document transisitions from dogs to stars.", "delimiter": "- The sun", "confidence": 0.9}
  2.
    Input: "Cats are friends. Cats are pets. Cats are mammals. Cats are animals."
    Output: {"explanation": "The document transitions from subjective to objective.", "delimiter": "Cats are pets", "confidence": 0.5}
  3.
    Input: "Lizards think differently from humans, in that their nervous systems have evolved separately from ours."  
    Output: {"explanation": "The document transitions using an appositive.", "delimiter": "in that their nervous", "confidence": 0.1}
`
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
