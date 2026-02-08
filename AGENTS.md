# AGENTS ガイド（learning-arcade）

このリポジトリで作業するエージェントは、実装前にまず `docs/` を確認すること。

## 1. 先に読むドキュメント

最低限、次を読む。

- `docs/repository-architecture.md`
- `docs/soroban-practice-mode-spec.md`
- `docs/soroban-test-mode-spec.md`
- `docs/soroban-game-mode-spec.md`

検定仕様やルールを触る場合は以下も読む。

- `docs/zenshugakuren-rules.md`

## 2. 実装ルール（このリポジトリ固有）

- ゲームモードの出題値は新規ロジックを作らず、`generateProblems(...)` を再利用する。
- 保存は既存キー `learning-arcade:soroban-state` を優先し、不要な localStorage キーを増やさない。
- ルート追加・変更時は `src/App.tsx` の `Route` 型と hash 判定を必ず同時更新する。
- 画像が無い場合に落ちないよう、placeholder/fallback を維持する。
- `VITE_REGISTER_ADMIN_MODE` は開発補助用。通常挙動に影響する変更は避ける。

## 3. 変更後チェック

- `npm run build` を通す。
- 既存のそろばん画面（`#/soroban`）とゲーム導線（`#/soroban/register`）が壊れていないことを確認する。

## 4. ドキュメント更新ルール

- 仕様変更時は、対応する `docs/*.md` を同じPR/コミットで更新する。
- 画面追加時は `docs/repository-architecture.md` のルーティング/構成を更新する。
