# qata-web

[qata](https://github.com/masakazu2025/qata) の web です。AI が MCP で登録したテストケースを一覧にし、元の日本語の手順と生成されたステップを見比べて承認し、実行して、ステップごとの結果とスクショを見ます。server の REST API だけを使います。

契約と全体の要件は、親のリポジトリ `qata` が正です。このリポジトリは、親と同じ作業フォルダに並べて置きます（`../qata/contracts/` を読むため）。親を別の場所に置くときは、環境変数 `QATA_PARENT_DIR` で親のリポジトリを指します。

```
作業フォルダ/
├── qata/          ← 親
└── qata-web/      ← ここ
```

## 関門

pull request と main への push のたびに、GitHub Actions（`.github/workflows/ci.yml`）が下と「端から端までのテスト」を回します（端から端までは、qata-server・qata-runner の main と Windows でつなぐ）。通らないと main にマージできません。

```
npm ci
npm run check          # 型の検査・テスト（生成した型と契約・画面）・書式
```

テストの偽の server が返すものは、すべて親の契約（JSON Schema）で判定します。

## 端から端までのテスト

隣に並べた qata-server・qata-runner と、この web を本物どうしでつないで、デモの流れ（AI が MCP でテストケースを登録 → web で承認 → 実行 → 結果とスクショ）を一本通します。偽物を本物に置き換えるたびに、これが通り続けることを関門にします。

```
作業フォルダ/
├── qata/
├── qata-runner/
├── qata-server/
└── qata-web/      ← ここで npm run e2e
```

```
npx playwright install chromium   # 初めてのときだけ
npm run e2e
```

`uv` が要ります。runner・server・web は既定とは別の番号（18001・18000・15173）で立ち上げ、終わったら止めます。保存先は毎回新しく作ります。各ステップの画面は `test-results/`、まとめは `npx playwright show-report` で見られます。

runner の操作は既定で偽物です。本物の電卓を動かして回すときは、下を使います（手元の Windows だけ。CI はデスクトップがないので偽物のまま）。電卓を起動し、キーボードとマウスを使うので、終わるまで触らないでください。

```
npm run e2e:windows    # runner を QATA_RUNNER_OPERATOR=windows で立ち上げる
```

## デモ版

https://qata-web.vercel.app/ で、server と runner なしに画面を触れます。ブラウザの中の偽の server が契約の例を返し、スクショは本物の電卓を撮ったもの（`src/demo/`）です。登録 → 承認 → 実行 → 結果とスクショを一通り試せます。データはブラウザの中だけで、再読み込みで最初に戻ります。

```
npm run build:demo                  # dist/ にデモ版を作る（Vercel もこれを使う、vercel.json）
npx vite preview --mode demo        # 手元で見る
```

main に入ると Vercel が公開し直します。pull request ごとにプレビューの URL も出ます。

## 契約から型を生成する

親の `openapi.yaml` から TypeScript の型を生成し、`src/contracts/openapi.ts` に置いてコミットします。手で直しません。契約が変わったら生成し直します。生成物が契約と合っているかは `npm test` で確かめます。

```
npm run generate
```

## 立ち上げる

qata-server（と qata-runner）を立ち上げてから、

```
npm run dev
```

`http://127.0.0.1:5173` を開きます。`/api` は qata-server（既定は `http://127.0.0.1:8000`、変えるときは環境変数 `QATA_SERVER_URL`）に中継します。一覧は 3 秒ごとに読み直すので、AI が MCP で登録したものが開いたままの画面に出ます。
