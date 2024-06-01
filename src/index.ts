#!/usr/bin/env node

import { chat, config, login, read, vision } from "./commands";
import { getInfo } from "./utils";
import { Command } from "commander";

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

(async () => {
  const packageInfo = await getInfo();

  const program = new Command()
    .name("rag-cli")
    .description("An AI tool to help you talk with your documents.")
    .version(
      packageInfo.version || "1.0.0",
      "-v, --version",
      "display version number"
    );

  program
    .addCommand(login)
    .addCommand(config)
    .addCommand(chat)
    .addCommand(read)
    .addCommand(vision);

  program.parse();
})();
