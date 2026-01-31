# learning-arcade

子ども向けの「学びミニゲーム」を集めるアーケード（母艦）です。最初の筐体は「そろばん（珠算）」。

## 起動

```bash
npm i
npm run dev
```

## GitHub Pages

- リポジトリ名：`learning-arcade`
- `Settings -> Pages` で **Source = GitHub Actions**
- `main` に push すると自動で `dist/` をビルドして公開します

> `vite.config.ts` の `base: "/learning-arcade/"` が重要です。

## 画面

- `/#` … トップ（アーケード）
- `/#/soroban` … そろばん（練習）
