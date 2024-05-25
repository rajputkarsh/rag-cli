import Configstore from "configstore";

interface GemAIConfig {
  apiKey: string;
  maxOutputTokens: number;
  topK: number;
  topP: number;
  temperature: number;
}

async function getConfig(): Promise<GemAIConfig | null> {
  const getConfig = new Configstore("rag-cli/config");

  if (!getConfig.size) {
    return null;
  }

  const config = (await getConfig.all) as GemAIConfig;

  return config;
}

export default getConfig;
