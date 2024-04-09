import openAI from "./OpenAI.js";

/*This function takes in an edited text along with the orginal chunks and embeddings
  It splits the text into a partition based on the original chunks.
  It processes the modified text
  It reinserts the original chunks back into the newly proccessed text
*/

async function reSplitEmbed(text, chunks, embeddings) {
  const regexPattern = chunks
    .map((chunk) => chunk.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"))
    .join("|");

  const splitRegex = new RegExp(`(${regexPattern})`);
  const splitTexts = text
    .split(splitRegex)
    .filter((element) => element.trim() !== "");

  const newChunks = [];
  const newEmbeddings = [];

  for (let splitIndex = 0; splitIndex < splitTexts.length; splitIndex++) {
    const index = chunks.indexOf(splitTexts[splitIndex]);
    if(index == - 1){
      const data = await splitEmbed(splitTexts[splitIndex]);
      newChunks.push(...data.texts)
      newEmbeddings.push(...data.embeddings);
    }
    else {
      newChunks.push(chunks[index]);
      newEmbeddings.push(embeddings[index]);
    }
  }
  
  return {
    texts: newChunks,
    embeddings: newEmbeddings
  };
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
  overLapping.push(section.substring((numberOfChunks - 2) * initialChunkSize));

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

  const combinedShort = combineShortText(splitSection).filter(
    (string) => string !== ""
  );
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
