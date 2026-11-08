# qata-web

[qata](https://github.com/masakazu2025/qata) の web です。AI が MCP で登録したテストケースを一覧にし、元の日本語の手順と生成されたステップを見比べて承認し、実行して、ステップごとの結果とスクショを見ます。server の REST API だけを使います。

契約と全体の要件は、親のリポジトリ `qata` が正です。このリポジトリは、親と同じ作業フォルダに並べて置きます（`../qata/contracts/` を読むため）。

```
作業フォルダ/
├── qata/          ← 親
└── qata-web/      ← ここ
```

## 関門

```
npm ci
npm run check          # 型の検査・テスト（生成した型と契約・画面）・書式
```

テストの偽の server が返すものは、すべて親の契約（JSON Schema）で判定します。

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
