import Configstore from "configstore";

interface RagCliConfig {
  apiKey: string;
  maxOutputTokens: number;
  topK: number;
  topP: number;
  temperature: number;
}

async function getConfig(): Promise<RagCliConfig | null> {
  const getConfig = new Configstore("rag-cli/config");

  if (!getConfig.size) {
    return null;
  }

  const config = (await getConfig.all) as RagCliConfig;

  return config;
}

export default getConfig;
