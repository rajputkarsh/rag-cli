import { logger } from "@/utils";
import { z } from "zod";

function handleError(error: unknown): void {
  if (error instanceof z.ZodError) {
    for (const issue of error.issues) {
      logger.error(issue.message);
    }
    process.exit(1);
  }

  if (typeof error === "string") {
    logger.error(error);
    process.exit(1);
  }

  if (error instanceof Error) {
    logger.error(error.message);
    process.exit(1);
  }

  logger.error("Something went wrong. Please try again.");
  process.exit(1);
}

export default handleError;
