// 親の契約（../qata/contracts/openapi.yaml）から TypeScript の型を生成する。
// 生成物は src/contracts/openapi.ts に置いてコミットする。手で直さない。
// 引数に出力先を渡すと、そこに書く（テストで生成し直して比べるため）。
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

const root = resolve(import.meta.dirname, "..");
export const contractUrl = pathToFileURL(resolve(root, "../qata/contracts/openapi.yaml"));
export const outputPath = resolve(root, "src/contracts/openapi.ts");

const HEADER =
  "// 親の契約 qata/contracts/openapi.yaml から生成した型。手で直さない。\n" +
  "// 生成し直す：npm run generate\n\n";

export async function generate() {
  const ast = await openapiTS(contractUrl);
  return HEADER + astToString(ast);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  writeFileSync(process.argv[2] ?? outputPath, await generate());
}
