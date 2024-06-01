import readline from "readline";
import { CONFIG_INFO } from "../../constants";
import { getConfig, getQAMessage, handleError, logger } from "../../utils";
import { chatModel } from "../../models";
import { getMemoryVectorStore, getSavedVectorStore } from "../../stores";
import { optionsSchema } from "../../validators";
import { PromptTemplate } from "@langchain/core/prompts";
import { Command, Option } from "commander";
import { compile } from "html-to-text";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveUrlLoader } from "langchain/document_loaders/web/recursive_url";
import ora from "ora";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "~ ",
  terminal: false,
});

const read = new Command()
  .name("read")
  .description("chat with document")
  .argument("<document path>", "path of the document")
  .addOption(
    new Option("-f, --file-type <type>", "select document file type").choices([
      "pdf",
      "text",
      "json",
      "csv",
      "url",
    ])
  )
  .option("-s, --save", "create new vector folder and save", false)
  .option("-t, --verbose", "(test mode) enable verbose mode ", false)
  .option("-l, --location <type>", "location of the vector store", undefined)
  .option("-n, --name <type>", "save vector with a name", undefined)
  .action(async (path, opts) => {
    const loader = ora("starting..").start();
    const spinner = ora("thinking..");

    const config = await getConfig();

    if (!config) {
      loader.stop();
      logger.error(
        "Missing configuration. Please use your API key and try logging in again."
      );
      logger.info("");
      process.exit(0);
    }

    try {
      let globalData = null;

      loader.text = "parsing..";
      const options = optionsSchema.parse({
        path,
        type: opts.fileType,
        ...opts,
      });

      loader.text = "loading documents..";
      switch (options.type) {
        case "pdf": {
          const pdfLoader = new PDFLoader(path);
          globalData = await pdfLoader.load();
          break;
        }
        case "json": {
          const jsonLoader = new JSONLoader(path);
          globalData = await jsonLoader.load();
          break;
        }
        case "text": {
          const textLoader = new TextLoader(path);
          globalData = await textLoader.load();
          break;
        }
        case "csv": {
          const csvLoader = new CSVLoader(path);
          globalData = await csvLoader.load();
          break;
        }
        case "url": {
          const compiledConvert = compile({ wordwrap: 130 });
          const loader = new RecursiveUrlLoader(path, {
            extractor: compiledConvert,
            maxDepth: 0,
            preventOutside: true,
          });
          globalData = await loader.load();
          break;
        }
        default:
          if (!config) {
            logger.error("Invalid file type.");
            logger.info("");
          }
          break;
      }

      if (!globalData) {
        loader.stop();
        logger.error(
          logger.error(
            "No data was loaded. Please check the input file path and try running the command again."
          )
        );
        logger.info("");
        process.exit(0);
      }

      loader.text = "creating vector store..";
      const loadedVectorStore =
        options.save || options.location
          ? await getSavedVectorStore(globalData, {
              save: options.save,
              location: options.location,
              name: options.name,
            })
          : await getMemoryVectorStore(globalData);

      loader.stop();

      logger.success("Hello! How can I help you?");
      logger.info("");

      rl.prompt();

      const chain = new RetrievalQAChain({
        combineDocumentsChain: loadQAStuffChain(chatModel, {
          prompt: PromptTemplate.fromTemplate(getQAMessage),
        }),
        returnSourceDocuments: true,
        retriever: loadedVectorStore.asRetriever({
          k: CONFIG_INFO.kwargs,
        }),
        verbose: options.verbose,
      });

      rl.on("line", async (line) => {
        switch (line.trim()) {
          case "exit":
            process.exit(0);
            // TODO: remove break later
            break;
          case "cls":
            console.clear();
            break;
          default: {
            rl.pause();
            spinner.start();

            await chain.invoke(
              { query: line.trim() },
              {
                callbacks: [
                  {
                    handleLLMNewToken(token: string) {
                      if (spinner.isSpinning) {
                        spinner.stop();
                      }
                      process.stdout.write(token);
                    },
                  },
                ],
              }
            );
          }
        }

        spinner.text = "thinking..";
        rl.resume();
        rl.prompt();
      });

      rl.on("close", () => {
        process.exit(0);
      });
    } catch (error) {
      loader.stop();
      spinner.stop();
      handleError(error);
    }
  });

  export default read;
