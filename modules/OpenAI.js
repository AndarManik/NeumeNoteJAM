class OpenAI {
  constructor() {
    this.apiKey = "";
    this.completionEndpoint = "https://api.openai.com/v1/chat/completions";
    this.embeddingEndpoint = "https://api.openai.com/v1/embeddings";
    this.maxRetries = 5;
    this.waitTime = 250;
  }

  setKey(apiKey) {
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }

  async autoRequest(apiCall) {
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        const result = await apiCall();
        return result;
      } catch (error) {
        this.retryCount++;
        await new Promise((resolve) =>
          setTimeout(resolve, this.waitTime * Math.pow(2, retries))
        );
        console.error(error);
      }
    }
  }

  async smartComplete(
    prompt,
    system = `Task:
  Determine the best text to replace the [[Smart Complete]] tag in the users message. Infer the desired text based on the intructions in the user's message. If no instructions are present, complete the users message.

Format: 
  Respond with only the text which would replace the [[Smart Complete]], for a simplified example respond with "dog's" if the user's message is "The man put on his [[Smart Complete]] leash before going for a walk.
  Include spaces or line breaks at the start and end if needed, for a simplified example respond with " gazelle" if the user's messagge is "The cheetah hunts the[[Smart Complete]]".
`
  ) {
    try {
      const response = await fetch(this.completionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
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
  }

  async partition(
    prompt,
    system = `Task:
  Identify unique delimiters within a user's message, enabling the segmentation of the message into distinct parts. Each segment should encapsulate a single idea, concept, or entity.
    
Requirements:
  Delimiters should be extracted from the end of each segment.
  Use several consecutive words as delimiters to ensure a single occurrence within the message.
  The output should be formatted as a JSON object with a single key delimiters, associated with a list of identified delimiters.
    
Example: 
  Given the message "If dogs are mammals, then dogs breath air. The sun is a star.", an appropriate output would be 
  {"delimiters": ["dogs breath air.", "a star."]}.
    
Output Format: 
  The result should be a JSON object that lists the identified delimiters.`
  ) {
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
  }

  async embed(text) {
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
  }

  async embedBatch(texts) {
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
