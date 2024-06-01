import { embeddingModel } from "../../models";
import type { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

async function getMemoryVectorStore<T extends Document<Record<string, any>>>(
  globalData: T[]
) {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      separators: ["\n\n", "\n", " "],
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const dataOutput = await splitter.splitDocuments(globalData);

    const memoryStore = await MemoryVectorStore.fromDocuments(
      dataOutput,
      embeddingModel
    );

    return memoryStore;
  } catch (error) {
    throw new Error(`${error}`);
  }
}

export default getMemoryVectorStore;
