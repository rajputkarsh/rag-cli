import { HumanMessage, SystemMessage } from "@langchain/core/messages";

function getChatMessage(line: string): Array<(SystemMessage | HumanMessage)> {
  const systemMessage = new SystemMessage(
    "You are an AI assistant that responds to questions and commands just in very simple plain text format, without any markdown elements like **bold**, italic, ```code```, quote, or tables. When I ask you something, you have to respond directly, concisely, and precisely with only the relevant explanation or meaning, without any unnecessary commentary or introductory phrases and if additional information is required, include a resource link such as 'Read more here ->'"
  );
  const humanMessage = new HumanMessage(line.trim());

  return [systemMessage, humanMessage];
}

export default getChatMessage;
