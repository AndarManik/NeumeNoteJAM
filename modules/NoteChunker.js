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

  if (modifiedTexts.length) {
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
  const textList = await Promise.all(
    texts.map(async (text) => {
      const initialChunks = initialSplit(text);
      const parallelChunksResult = await parallelChunk(initialChunks);
      return combineChunks(parallelChunksResult);
    })
  );

  const flatEmbeddings = await openAI.embedBatch(textList.flat());
  const embeddings = [];

  textList.forEach((text, index) => {
    embeddings[index] = flatEmbeddings.splice(0, text.length);
  });

  return { texts: textList, embeddings };
}

async function splitEmbed(text) {
  const texts = await markdownSplitter(text);
  const embeddings = await openAI.embedBatch(texts);
  return { texts, embeddings };
}


async function markdownSplitter(text) {
  // Split the text by markdown headers
  const sections = text.split(/(?=^#{1,6} )/gm);
  const toFlat = await Promise.all(sections.map(embedSection));
  return toFlat.flat();
}

async function embedSection(section) {
  if (section.length < 750) {
    return [section];
  } else {
    const smartSplitIndexes = await smartSplit(section);
    return recombine(smartSplitIndexes, section);
  }
}

async function smartSplit(section) {
  const numberOfChunks = Math.ceil(section.length / 375);
  const initialChunkSize = Math.ceil(section.length / numberOfChunks);

  const overLapping = [];
  for (let index = 0; index < numberOfChunks - 2; index++) {
    overLapping.push(
      section.substring(
        index * initialChunkSize,
        (index + 2) * initialChunkSize
      )
    );
  }
  overLapping.push(
    section.substring((numberOfChunks - 2) * initialChunkSize)
  );


  const smartSplitIndexes = await Promise.all(
    overLapping.map(async (split, index) => {
      var data = await openAI.split(split);
      var splitIndex = split.indexOf(data.delimiter);
      while (splitIndex == -1) {
        data = await openAI.split(split);
        splitIndex = split.indexOf(data.delimiter);
      }
      return {
        index: splitIndex + index * initialChunkSize,
        delimiter: data,
      };
    })
  );


  smartSplitIndexes.sort((a, b) => a.index - b.index);
  return smartSplitIndexes;
}

function recombine(smartSplitIndexes, section) {
  const splitSection = [];

  let prevIndex = 0;
  smartSplitIndexes.forEach((nextIndex) => {
    splitSection.push(section.substring(prevIndex, nextIndex.index));
    prevIndex = nextIndex.index;
  });
  splitSection.push(section.substring(prevIndex));

  const combinedShort = combineShortText(splitSection).filter(string => string !== "");
  return combinedShort;
}

function combineShortText(splitSection, min = 500, max = 750) {
  for (let index = 0; index < splitSection.length - 1; index++) {
    if (
      splitSection[index].length < min &&
      splitSection[index].length + splitSection[index + 1].length < max
    ) {
      splitSection[index] += splitSection[index + 1];
      splitSection.splice(index + 1, 1);
      return combineShortText(splitSection);
    }
  }

  const indexLast = splitSection.length - 1;

  if (
    splitSection[indexLast].length < min &&
    splitSection[indexLast].length + splitSection[indexLast - 1].length < max
  ) {
    splitSection[indexLast - 1] += splitSection[indexLast];
    splitSection.splice(indexLast, 1);
  }
  return splitSection;
}

export { splitEmbed, reSplitEmbed };
