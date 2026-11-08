// 端から端までのテストを、本物の runner（pywinauto で Windows の電卓を動かす）で回す（npm run e2e:windows）。
// 手元だけで使う。CI はデスクトップがないので、偽の runner のまま（npm run e2e）。
// 引数はそのまま playwright test に渡す（例：npm run e2e:windows -- --headed）。
import { spawnSync } from "node:child_process";

console.log("本物の電卓を起動して、キーボードとマウスを使います。終わるまで触らないでください。");

const result = spawnSync("npx", ["playwright", "test", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, QATA_RUNNER_OPERATOR: "windows" },
});
process.exit(result.status ?? 1);
