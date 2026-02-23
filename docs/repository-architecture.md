# learning-arcade リポジトリ構成・アーキテクチャ

このドキュメントは、`learning-arcade` 全体の構成と責務分割を AI/開発者向けに整理したものです。  
`docs/` 配下のため、通常ビルドには含まれません。

## 1. 技術スタック

- フロントエンド: React 18 + TypeScript
- ビルド: Vite 5
- スタイリング: Tailwind CSS（`src/styles/index.css` で共通CSSも定義）
- ルーティング: 外部ライブラリなし（`window.location.hash` を手動パース）
- 状態保存: `localStorage`（一部機能）

## 2. ディレクトリ構成

```text
src/
  App.tsx                # ルーティングと画面切替の中心
  main.tsx               # Reactエントリポイント
  assets/                # 画像アセット
  styles/
    index.css            # Tailwind読込 + 共通アニメーション/変数
  domain/
    specs/               # 検定仕様（級別ルール・型）
    generator/           # 問題生成ロジック
  features/
    arcade/              # アーケードTOP
    practice/            # テスト/れんしゅうモード（views/, components/, hooks）
    soroban/             # ゲームモード（views/, components/ + 保存状態）
  ui/
    components/          # 汎用UI部品（Button, Selectなど）
docs/                    # 実装向けドキュメント（ビルド非対象）
```

## 3. レイヤー設計

依存方向は次を基本にする。

1. `domain`（純ロジック）
2. `features`（画面/ユースケース）
3. `ui`（再利用可能な表示部品）
4. `App.tsx`（画面統合・遷移）

`domain` は React に依存しない。  
`features` は `domain` と `ui` を利用して画面要件を実装する。

## 4. ルーティング設計

`src/App.tsx` で `hashchange` を監視し、`Route` を切り替える方式。

- `/#` : `ArcadeHome`
- `/#/soroban` : `PracticePage`
- `/#/soroban/register` : `RegisterTopPage`
- `/#/soroban/register/play` : `RegisterGamePage`
- `/#/soroban/shop` : `ShopPage`
- `/#/soroban/shop/payment/:itemId` : `ShopPaymentPage`
- `/#/soroban/shelf` : `ShelfPage`
- `/#/soroban/snack` : `SnackBudgetGamePage`
- `/#/soroban/admin` : `RegisterAdminPage`

補足:

- `VITE_REGISTER_ADMIN_MODE` が truthy（`1/true/on`）ならグローバルに `ADMIN MODE` バッジ表示。

## 5. ドメイン層（問題生成）

主要ファイル:

- `src/domain/specs/types.ts` : 仕様型（`Grade`, `Subject`, `ExamBody` など）
- `src/domain/specs/kenteiSpec.ts` : 級別出題仕様データ
- `src/domain/generator/index.ts` : `generateProblems` の入口
- `src/domain/generator/*.ts` : 種目別生成（`mul`, `div`, `mitori`, `denpyo`）

出題の中心API:

- `generateProblems(grade, subject, examBody): Problem[]`
- `subjectMinutes(grade, subject, examBody): number`

`Problem` は `question`, `answer`, `kind` を持つ共通型。

## 6. 機能層（features）

## 6.1 arcade

- `ArcadeHome.tsx`
- 学習ゲームの母艦トップ画面。

## 6.2 practice（テスト/れんしゅう）

- `views/PracticePage.tsx` が親。
- テストモード:
  - `ProblemSheet`, `AnswerSheet`, `TimerBar`, `useTimer`
- れんしゅうモード:
  - `OneByOnePractice`

保存連携:

- `loadPracticeConfig` / `savePracticeConfig`（`features/soroban/state.ts`）

## 6.3 soroban（ゲームモード）

- `RegisterTopPage` : ゲームTOP（条件選択）
- `RegisterGamePage` : レジゲーム本編
- `ShopPage` : 報酬ショップTOP（商品一覧）
- `ShopPaymentPage` : 支払い画面（商品ごと）
- `ShelfPage` : 棚スロット配置（タップ起点モーダルで購入済みグッズを配置）
- `SnackBudgetGamePage` : 300円おやつゲーム（棚の商品をドラッグ＆ドロップでカゴに入れ、お会計時に結果判定）
- `RegisterAdminPage` : セーブデータ編集（管理者画面）
- `SceneFrame` : ゲーム系共通フレーム
- `catalog.ts` : ショップ商品定義
- `state.ts` : ゲーム進行と保存管理

重要ルール:

- ゲームの出題値は `generateProblems` を再利用（練習と同一ロジック）。
- 見せ方のみゲーム向けに変換。

## 7. 状態管理・永続化

単一キーで保存:

- key: `learning-arcade:soroban-state`
- データ:
  - `practiceConfig`
  - `registerProgress`

`registerProgress` は以下を保持:

- コイン
- 購入済みアイテム
- 棚サイズ/スロット
- 解放済み級・種目ステージ

`state.ts` 内で正規化関数を通し、欠損や不正値を補正する設計。

## 8. UI層（ui/components）

再利用可能な軽量部品を格納。

- `Button`
- `Select`
- `NumberInput`
- `Toggle`

各 feature はこれらを組み合わせて画面を構築する。

## 9. スタイリング方針

- Tailwind utility をベースに実装。
- `src/styles/index.css` で:
  - フォント変数（`--sheet-font`, `--pop-font`）
  - 印刷時ルール
  - 正誤演出アニメーション（`flash-good`, `flash-bad`）

## 10. ビルド・実行

`package.json` scripts:

- `npm run dev` : 通常起動
- `npm run dev:admin` : adminモード起動
- `npm run build` : 本番ビルド
- `npm run preview` : ビルド確認
- `npm run typecheck` : 型検査

## 11. 変更時のガイドライン（AI向け）

1. 出題仕様変更は `domain/specs` と `domain/generator` を起点に行う。
2. 画面挙動変更は `features/*` に閉じる。
3. 保存仕様変更時は `state.ts` の正規化・後方互換を維持する。
4. ルート追加時は `App.tsx` の `Route` 型と hash パーサを同時更新する。
5. 変更後は最低 `npm run build` を実行して破壊的変更を検知する。

## 12. 関連ドキュメント

- `docs/soroban-game-mode-spec.md`
- `docs/soroban-practice-mode-spec.md`
- `docs/soroban-test-mode-spec.md`
- `docs/zenshugakuren-rules.md`
