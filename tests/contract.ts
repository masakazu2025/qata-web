// 親の契約（既定は ../qata/contracts/、QATA_PARENT_DIR で変えられる）を読んで、テストの偽の server が返すものを判定する。
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parentDir } from "../scripts/generate-contracts.mjs";

export const contractsDir = resolve(parentDir, "contracts") + "/";

export function readExample<T>(name: string): T {
  return JSON.parse(readFileSync(`${contractsDir}examples/${name}`, "utf8")) as T;
}

const ajv = new Ajv2020({ allErrors: true, strict: false, discriminator: true });
addFormats(ajv);
for (const file of readdirSync(`${contractsDir}schemas`)) {
  const schema = JSON.parse(readFileSync(`${contractsDir}schemas/${file}`, "utf8"));
  ajv.addSchema({ ...schema, $id: file });
}

/** server.schema.json の $defs の名前（run、testcase_record など）で判定し、合わなければ投げる。 */
export function assertServerShape(def: string, value: unknown): void {
  const validate = ajv.getSchema(`server.schema.json#/$defs/${def}`);
  if (!validate) throw new Error(`契約に ${def} がない`);
  if (!validate(value)) {
    throw new Error(`${def} が契約に合わない：${ajv.errorsText(validate.errors)}`);
  }
}
