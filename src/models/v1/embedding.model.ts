import { getConfig, handleError } from "@/utils";
import { TaskType } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const configInfo = await getConfig();

const embeddingModel = new GoogleGenerativeAIEmbeddings({
  modelName: "embedding-001",
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  apiKey: configInfo?.apiKey ?? "<empty_string>",
  onFailedAttempt: (error) => {
    handleError(error);
  },
  stripNewLines: false,
});

export default embeddingModel;
