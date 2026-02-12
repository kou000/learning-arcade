# そろばん れんしゅうモード仕様（AI実装者向け）

このドキュメントは `#/soroban` の「れんしゅうモード（one-by-one）」の実装仕様をまとめたものです。  
`docs/` 配下のため、通常のビルド成果物には含まれません。

## 1. 対象画面と切替

- 画面: `src/features/practice/views/PracticePage.tsx`
- モード値: `mode === "one-by-one"`
- UI切替ボタン:
  - テストモード
  - れんしゅうモード
  - ゲームモード（`#/soroban/register`）

## 2. 出題ロジック

練習モードは共通ジェネレーターを使う。

- 関数: `generateProblems(grade, subject, examBody)`
- one-by-one では 1 セットのみ生成
- 問題型:
  - `vertical`（見取り算など）
  - `inline`（かけ算/わり算など）

## 3. 設定保存

保存窓口は `src/features/soroban/state.ts`。

- localStorage key: `learning-arcade:soroban-state`
- `practiceConfig` に保存される値:
  - `grade`
  - `subject`
  - `examBody`
  - `mode`（`"one-by-one"`）
  - `sets`
  - `showAnswers`

## 4. UI構成

## 4.1 親ページ

`views/PracticePage.tsx` で以下を管理:

- 条件コントロール（`ControlBar`）
- タイトル/検定・級・種目表示
- モードトグル
- 出題再生成（つくりなおす）
- one-by-one の本体コンポーネント描画

## 4.2 one-by-one 本体

`src/features/practice/components/OneByOnePractice.tsx`

- 問題進行:
  - 現在問題 index
  - 問題ジャンプ（丸ボタン）
- 回答:
  - 入力欄
  - `かいとうする`
  - `わからない`（最終問題では `おわり`）
- 結果:
  - `correct / wrong / null` を問題ごとに保持
  - 正解時は「せいかい」フラッシュ + 自動で次問題へ
  - 不正解時は「ふせいかい」フラッシュ

## 4.3 ビジュアルキーボード

`OneByOnePractice.tsx` 内で入力補助を持つ。

- 数字並び: `123 / 456 / 789` + `± / 0 / ←`
- `クリア` ボタンあり

## 5. 判定仕様

- 正誤判定は空白除去した文字列同士で比較
- 正解条件:
  - `normalizedInput === normalizedAnswer`
  - かつ入力長 > 0
- 「わからない」は未判定問題を `wrong` 扱いで次へ進む

## 6. 既知の制約

- タイマーUIはテストモード専用（one-by-oneでは非表示）
- `showAnswers` もテストモード専用表示
- `examBody` は現在 UI では `zenshugakuren` のみ選択可

## 7. 改修ガイド（AI向け）

1. 出題値そのものは `generateProblems` の結果を改変しない
2. one-by-one の挙動変更は `OneByOnePractice.tsx` に閉じる
3. 保存項目追加時は `state.ts` の正規化を必ず更新する
4. 変更後は `npm run build` と操作確認（正解時オート進行）を行う
