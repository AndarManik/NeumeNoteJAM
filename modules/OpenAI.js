class OpenAI {
  constructor() {
    this.apiKey = "";
    this.model = "";
    this.completionEndpoint = "https://api.openai.com/v1/chat/completions";
    this.embeddingEndpoint = "https://api.openai.com/v1/embeddings";
    this.modelsEndpoint = "https://api.openai.com/v1/models"
    this.maxRetries = 5;
    this.waitTime = 500;
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
        throw new Error(
          `Network response was not ok, status: ${response.status}`
        );
      }

      const models = await response.json();
      this.model = "gpt-3.5-turbo-0125";
      models.data.forEach(model => {
        if(model.id == "gpt-4-turbo-preview") {
          this.model = "gpt-4-turbo-preview";
        }
      })

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

  async smartComplete(
    prompt,
    system = `Role:
  You are an editor for a document.
Task:
  Determine the best text to replace the "[[SmartComplete]]" text in the "User's Message". Infer the desired text based on the intructions in the "User's Message". If no instructions are present, complete the "User's Message".
  Enhance your response by utilizing the information in the"External Context". Infer based on the user's instruction whether to incorporate information from "External Context".
Format: 
  Respond with only the text which would replace the [[SmartComplete]], for a simplified example respond with "dog's" if the "User's Message" is "The man put on his [[SmartComplete]] leash before going for a walk."
  Include spaces or line breaks at the start and end if needed, for a simplified example respond with " gazelle" if the "User's Message" is "The cheetah hunts the[[SmartComplete]]".
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
  Identify unique delimiters within a user's message, enabling the segmentation of the message into distinct parts. Each segment should encapsulate a single idea, concept, or entity with high granularity.
    
Requirements:
  Delimiters should be extracted from the end of each segment.
  Use several consecutive words as delimiters to ensure a single occurrence within the message.
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
