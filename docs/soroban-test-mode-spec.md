# そろばん テストモード仕様（AI実装者向け）

このドキュメントは `#/soroban` の「テストモード（test）」の実装仕様をまとめたものです。  
`docs/` 配下のため、通常のビルド成果物には含まれません。

## 1. 対象画面と切替

- 画面: `src/features/practice/views/PracticePage.tsx`
- モード値: `mode === "test"`
- モード切替は同ページ上のボタンで行う

## 2. 出題ロジック

テストモードも共通ジェネレーターを使う。

- 関数: `generateProblems(grade, subject, examBody)`
- 生成単位:
  - 1セット = 問題配列1つ
  - `sets` 分だけ複数セット生成
- データ保持:
  - `bundles: Problem[][]`

## 3. 設定保存

保存窓口は `src/features/soroban/state.ts`。

- localStorage key: `learning-arcade:soroban-state`
- `practiceConfig` に保存:
  - `grade`
  - `subject`
  - `examBody`
  - `mode`（`"test"`）
  - `sets`（1〜10）
  - `showAnswers`

## 4. UI構成

## 4.1 設定バー

`src/features/practice/components/ControlBar.tsx`

テストモード時に表示される項目:

- 検定
- 級
- 種目
- セット数
- 解答を表示（toggle）
- つくりなおす

## 4.2 タイマー

- コンポーネント: `src/features/practice/components/TimerBar.tsx`
- ロジック: `src/features/practice/hooks/useTimer.ts`
- 制限時間:
  - `subjectMinutes(grade, subject, examBody)` から秒へ変換して初期化
- 操作:
  - スタート
  - 一時停止
  - リセット

## 4.3 問題/解答表示

- 問題シート: `src/features/practice/components/ProblemSheet.tsx`
  - `vertical` 問題は 5問ごとの縦レイアウト
  - `inline` 問題は2カラムレイアウト
- 解答シート: `src/features/practice/components/AnswerSheet.tsx`
  - `showAnswers === true` の時だけ表示
- 印刷:
  - セットごとに `window.print()` ボタンあり

## 5. 挙動ルール

- 設定変更（級/種目/モード/セット数）で問題を再生成
- `examBody` は実質 `zenshugakuren` に補正される
- 級により伝票算がない場合、`denpyo` 選択は `mitori` に補正

## 6. 他モードとの関係

- れんしゅうモード（one-by-one）とは同じ `PracticePage` で分岐
- ゲームモードへは `ゲームモード` ボタンで `#/soroban/register` に遷移
- 出題コア（`generateProblems`）は全モード共通

## 7. 改修ガイド（AI向け）

1. テスト固有の変更は `views/PracticePage.tsx` の `mode === "test"` 分岐に寄せる
2. 問題用紙の見た目変更は `ProblemSheet.tsx` に閉じる
3. タイマー仕様変更は `useTimer.ts` と `TimerBar.tsx` をセットで更新
4. 変更後は `npm run build` と印刷プレビュー動作を確認する
