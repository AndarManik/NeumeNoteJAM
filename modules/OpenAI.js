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
    system = `Role: You are the "smart complete" feature in a note taking app. The text you provide will replace the [[Smart Complete]] tag.
Task: Follow the instructions provided by the user near the [[Smart Complete]]. If no instructions are provided complete or expand on the text based on the context before and after the [[Smart Complete]] tag.
Style: Unless specified otherwise by the user, respond in sentences seperated with linebreaks. Make these sentence detailed but concise.
Format: There may not be white space before or after the [[Smart Complete]] tag, inlclude leadeing and trailing whitespace.`
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

      console.log(response.body);
      return response.body;
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  async partition(
    prompt,
    system = `Task: Partition the text into a list of chunks and return that list in a JSON object.
Details: Ensure each chunk pertains to one idea, concept, or thing. Split large text with many ideas into many smaller chunks. Combine many small texts with one common idea into one larger chunk.
Format: The JSON object should have one key 'chunks' with the value being a list of strings.`
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
        presence_penalty: -2,
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
}

const openAI = new OpenAI();
export default openAI;
