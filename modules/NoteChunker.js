import openAI from "./OpenAI.js";

async function splitEmbed(text) {
  const initialChunks = initialSplit(text);
  console.log("Initial Chunks:", initialChunks); // Log initial chunks
  const parallelChunksResult = await parallelChunk(initialChunks);
  console.log("Parallel Chunks Result:", parallelChunksResult); // Log result of parallel chunking
  const texts = combineChunks(parallelChunksResult);
  console.log("Combined Texts:", texts); // Log combined texts
  const embeddings = await openAI.embedBatch(texts);
  console.log("Embeddings:", embeddings); // Log embeddings
  return { texts, embeddings };
}

function initialSplit(text) {
  var startIndex = 0;
  const initialChunks = [];
  const characters = Array.from(text);
  const numberOfChunks = Math.ceil(characters.length / 1000);
  const initialChunkSize = Math.ceil(characters.length / numberOfChunks);

  for (var i = 0; i < numberOfChunks; i++) {
    const endIndex = startIndex + initialChunkSize;
    initialChunks.push(characters.slice(startIndex, endIndex).join(""));
    startIndex = endIndex;
  }

  console.log("Initial Split Result:", initialChunks); // Log the result of the initial split
  return initialChunks;
}

async function parallelChunk(initialChunks) {
  const resolvedChunks = [];

  await Promise.all(
    initialChunks.map(async (chunk, index) => {
      const parition = await openAI.partition(chunk);
      resolvedChunks[index] = parition.strings;
    })
  );

  console.log("Resolved Chunks:", resolvedChunks); // Log the resolved chunks
  return resolvedChunks;
}

function combineChunks(parallelChunks) {
  const texts = [];
  const numberOfChunks = parallelChunks.length;

  for (var i = 0; i < numberOfChunks - 1; i++) {
    texts.push(...parallelChunks[i]);
    texts[texts.length - 1] += parallelChunks[i + 1][0];
    parallelChunks[i + 1].shift();
  }

  texts.push(...parallelChunks[numberOfChunks - 1]);

  console.log("Combined Chunks:", texts); // Log the final combined texts
  return texts;
}

export default splitEmbed;
