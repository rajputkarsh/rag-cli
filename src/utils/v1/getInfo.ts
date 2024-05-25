import packageJson from "package-json";
import type { PackageJson } from "type-fest";

async function getInfo(): Promise<PackageJson> {
  const packageInfo = await packageJson("rag-cli");
  return packageInfo as PackageJson;
}

export default getInfo;
