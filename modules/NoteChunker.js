import openAI from "./OpenAI.js";

/*This function takes in an edited text along with the orginal chunks and embeddings
  It splits the text into a partition based on the original chunks.
  It processes the modified text
  It reinserts the original chunks back into the newly proccessed text
*/

async function reSplitEmbed(text, chunks, embeddings) {
  const { modifiedTexts, modifiedIndexes, chunkIndexes } = reSplit(
    text,
    chunks
  );

  const combinedChunks = [];
  const combinedEmbeddings = [];

  if(modifiedTexts.length) {
    const modifiedData = await splitEmbedBatch(modifiedTexts);
    
    for (let i = 0; i < modifiedData.texts.length; i++) {
      combinedChunks[modifiedIndexes[i]] = modifiedData.texts[i];
      combinedEmbeddings[modifiedIndexes[i]] = modifiedData.embeddings[i];
    }
  }
  

  chunkIndexes.forEach((chunk, chunkIndex) => {
    chunk.forEach((index) => {
      combinedChunks[index] = chunks[chunkIndex];
      combinedEmbeddings[index] = embeddings[chunkIndex];
    });
  });



  return {
    texts: combinedChunks.flat(),
    embeddings: combinedEmbeddings.flatMap((item) =>
      Array.isArray(item[0]) ? item : [item]
    ),
  };
}

function reSplit(text, chunks) {
  const regexPattern = chunks
    .map((chunk) => chunk.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"))
    .join("|");

  const splitRegex = new RegExp(`(${regexPattern})`);
  const splitTexts = text
    .split(splitRegex)
    .filter((element) => element.trim() !== "");

  splitTexts
    .map((text) => (chunks.indexOf(text) == -1 ? initialSplit(text) : text))
    .flat();

  const modifiedTexts = [];
  const modifiedIndexes = [];
  const chunkIndexes = chunks.map(() => []);

  splitTexts.forEach((splitText, index) => {
    const indexChunk = chunks.indexOf(splitText);
    if (indexChunk == -1) {
      modifiedTexts.push(splitText);
      modifiedIndexes.push(index);
      return;
    }

    chunkIndexes[indexChunk].push(index);
  });

  return { modifiedTexts, modifiedIndexes, chunkIndexes };
}

async function splitEmbedBatch(texts) {
  const textList = await Promise.all(texts.map(async (text) => {
    const initialChunks = initialSplit(text);
    const parallelChunksResult = await parallelChunk(initialChunks);
    return combineChunks(parallelChunksResult);
  }));

  const flatEmbeddings = await openAI.embedBatch(textList.flat());
  const embeddings = [];

  textList.forEach((text, index) => {
    embeddings[index] = flatEmbeddings.splice(
      0,
      text.length
);
  });
  
  return {texts: textList, embeddings};
}

async function splitEmbed(text) {
  const initialChunks = initialSplit(text);
  const parallelChunksResult = await parallelChunk(initialChunks);
  const texts = combineChunks(parallelChunksResult);
  const embeddings = await openAI.embedBatch(texts);
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

  return initialChunks;
}

async function parallelChunk(initialChunks) {
  const resolvedChunks = [];

  await Promise.all(
    initialChunks.map(async (chunk, index) => {
      const partition = await openAI.partition(chunk);
      console.log(partition);
      const subParition = [];
      var tail = chunk;
      partition.delimiters.forEach((delimiter) => {
        const indexOf = tail.indexOf(delimiter);
        if (indexOf == -1) {
          return;
        }
        const lengthOfHead = indexOf + delimiter.length;
        const head = tail.substring(0, lengthOfHead);
        tail = tail.substring(lengthOfHead);
        subParition.push(head.trim());
      });

      if (tail.trim()) {
        subParition.push(tail.trim());
      }

      resolvedChunks[index] = subParition;
    })
  );

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

  return texts;
}

export { splitEmbed, reSplitEmbed };
