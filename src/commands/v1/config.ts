import { getConfig, handleError, logger } from "@/utils";
import chalk from "chalk";
import { Command } from "commander";
import Configstore from "configstore";
import { colorize, color } from "json-colorizer";
import ora from "ora";
import prompts from "prompts";

const config = new Command()
  .name("config")
  .description("see your configured rag-cli credentails")
  .action(async () => {
    const spinner = ora("Getting config file...").start();

    const configInfo = await getConfig();

    if (!configInfo) {
      spinner.stop();
      logger.error(
        "Missing configuration. Please use your API key and try logging in again."
      );
      logger.info("");
      process.exit(0);
    }
    try {
      spinner.succeed("Configuration file successfully retrieved.");

      logger.info("");
      console.log(
        colorize(JSON.stringify(configInfo, null, 2), {
          colors: {
            StringKey: color.white,
            StringLiteral: color.red,
            NumberLiteral: color.redBright,
            Whitespace: color.bgWhite,
            Brace: color.bgCyan,
            Bracket: color.yellow,
            Colon: color.bgGreen,
            Comma: color.bgGreen,
            BooleanLiteral: color.bgCyan,
            NullLiteral: color.bgCyan,
          },
        })
      );
      logger.info("");
      process.exit(0);
    } catch (error) {
      spinner.stop();
      handleError(error);
    }
  });

config
  .command("set")
  .description("update config file")
  .action(async () => {
    const configInfo = await getConfig();

    if (!configInfo) {
      logger.error(
        "Missing configuration. Please use your API key and try logging in again."
      );
      logger.info("");
      process.exit(0);
    }

    try {
      const options = await prompts(
        [
          {
            type: "text",
            name: "maxOutputTokens",
            message: "maxOutputTokens?",
            initial: 2048,
            validate: (value) =>
              value <= 2048 || "maxOutputTokens must be smaller than 2048",
          },
          {
            type: "text",
            name: "topK",
            message: "topK?",
            initial: 40,
            validate: (value) =>
              value <= 100 || "topK must be smaller than 100",
          },
          {
            type: "text",
            name: "topP",
            message: "topP?",
            initial: 1,
            validate: (value) => value <= 1 || "topP must be smaller than 1",
          },
          {
            type: "text",
            name: "temperature",
            message: "temperature?",
            initial: 0.7,
            validate: (value) =>
              value <= 1 || "temperature must be smaller than 1",
          },
          {
            type: "toggle",
            name: "verbose",
            message: "verbose?",
            initial: false,
            active: "true",
            inactive: "false",
          },
          {
            type: "text",
            name: "kwargs",
            message: "kwargs?",
            initial: 10,
            validate: (value) =>
              value <= 10 || "kwargs must be smaller than 10",
          },
        ],
        {
          onCancel: () => {
            logger.info("");
            logger.warn("Configuration update cancelled.");
            logger.info("");
            process.exit(0);
          },
        }
      );

      const getconfig = new Configstore("rag-cli/config");

      getconfig.set("maxOutputTokens", options.maxOutputTokens);
      getconfig.set("topK", options.topK);
      getconfig.set("topP", options.topP);
      getconfig.set("temperature", options.temperature);

      logger.info("");
      logger.info(`${chalk.green("Success!")} Configuration updated.`);
      logger.info("");
    } catch (error) {
      handleError(error);
    }
  });

export default config;
