# そろばんゲームモード仕様（AI実装者向け）

このドキュメントは `learning-arcade` のそろばんゲームモード（レジゲーム）について、AI/開発者が改修しやすいように構成と制約をまとめたものです。  
`docs/` 配下なので通常の Vite ビルド成果物には含まれません（コードから import しない限りバンドル対象外）。

## 1. ルーティング構成

`src/App.tsx` で hash を手動パースして画面を切り替える。

- `#/soroban` : 練習ページ（`PracticePage`）
- `#/soroban/register` : ゲームモードTOP（`RegisterTopPage`）
- `#/soroban/register/play` : レジゲーム本編（`RegisterGamePage`）
- `#/soroban/shop` : ショップTOP（`ShopPage`）
- `#/soroban/shop/payment/:itemId` : 支払い画面（`ShopPaymentPage`）
- `#/soroban/shelf` : 棚（`ShelfPage`）
- `#/soroban/snack` : 300円おやつゲーム（`SnackBudgetGamePage`）
- `#/soroban/admin` : 管理者画面（`RegisterAdminPage`）

## 2. 出題ロジックの原則

ゲームモードは新規出題ロジックを持たず、練習モードと同じジェネレーターを使用する。

- ジェネレーター: `generateProblems(grade, subject, examBody)`
- 実装箇所:
  - 練習: `src/features/practice/views/PracticePage.tsx`
  - ゲーム: `src/features/soroban/views/RegisterGamePage.tsx`

つまり「数値・答え」は共通で、ゲーム側は表示演出のみ変換する。

## 3. 設定/保存（localStorage）

`src/features/soroban/state.ts` が保存窓口。

- キー: `learning-arcade:soroban-state`
- 保存データ:
  - `practiceConfig`（練習/ゲーム共通の出題条件）
  - `registerProgress`（コイン、購入済み、棚、解放進行）
  - `registerPlayConfig`（ゲームの級/種目/ステージ/読み上げ速度）

### practiceConfig

- `grade`, `subject`, `examBody`, `mode`, `sets`, `showAnswers`
- 正規化で `examBody` は実質 `zenshugakuren` に寄せる運用

### registerProgress

- `coins`
- `purchasedItemIds`
- `shelfRows`, `shelfCols`, `shelfSlots`
- `unlockedGrades`
- `unlockedStageByGrade`（`0:みとり`, `1:かけ`, `2:わり`）

## 4. ゲーム進行の解放仕様

`state.ts` の `advanceRegisterProgressOnClear` を利用。

- 初期: 最易級の `みとり` のみ
- クリア順: `みとり -> かけ -> わり`
- 同一級で `わり` クリア後、次の級を解放
- ただし `views/RegisterGamePage.tsx` では合格ライン通過時のみ解放処理を適用
  - `REGISTER_PASS_RATE = 0.7`
  - 一度でも誤答した問題は不正解として記録（`wrongProblemIndexes`）
- ステージは `1..6`。
  - `1..3`: 通常ステージ（従来どおり）
  - `4..6`: チャレンジステージ（背景は同じで、右側ボタンでパネル切替）
- 級/種目の解放は従来どおり `ステージ3` クリア時のみ進行する（`4..6` クリアでは解放進行しない）
- 問題数:
  - 見取り算:
    - ステージ1: 2問
    - ステージ2: 2問
    - ステージ3: 3問
    - ステージ4: 5問
    - ステージ5: 7問
    - ステージ6: 各級の検定仕様と同じ問題数（現行運用では 10問）
  - 掛け算/割り算:
    - ステージ1: 3問
    - ステージ2: 3問
    - ステージ3: 5問
    - ステージ4: 7問
    - ステージ5: 10問
    - ステージ6: 各級の検定仕様と同じ問題数（現行運用では 20問）
- 時間制限:
  - ステージ1は制限なし
  - ステージ2は従来の余裕秒数付きロジック
  - ステージ3〜6は「1問あたり秒数 × 問題数」で計算（ステージ3と同じロジック）

## 5. 画面責務

## 5.1 RegisterTopPage（ゲームTOP）

ファイル: `src/features/soroban/views/RegisterTopPage.tsx`

- 役割:
  - 解放済み範囲で `級` / `レジ問題` を選択
  - スタートで `#/soroban/register/play` へ遷移
- 背景画像:
  - `src/assets/register-game-top.png`

## 5.2 RegisterGamePage（本編）

ファイル: `src/features/soroban/views/RegisterGamePage.tsx`

- 役割:
  - 問題読み上げ（吹き出し）
  - 回答入力（テンキー上部にレジ表示風の大型ディスプレイを表示）
  - 正誤演出
  - 報酬付与
  - ラウンド終了時の結果表示/解放メッセージ
  - ラウンド終了後、開始時コインから獲得分を右側でカウントアップ表示する
- 問題表示モードでは、一度誤答した問題に対して「このもんだいをスキップ」ボタンを表示する
  - スキップで次の問題へ進行できる（最終問題でスキップした場合はその場でステージ結果を表示）
- ステージ終了時に「ふくしゅうする」ボタンを表示し、そのステージで出題された問題から復習対象を選択して再挑戦できる
  - 既定では誤答/スキップした問題を選択状態にする
  - 復習は同ステージ内の出題問題のみを再利用し、新規生成はしない

### 報酬ルール（現行）

- 問題正解時: 1問ごとに `base + gradeBonus` コイン
  - `base`: `みとり=4`, `かけ/わり=2`
  - `gradeBonus`: `ceil((9 - grade) / 2)`（最低 0）
- ステージをクリアした時: ステージクリア報酬を付与
  - ステージ1: `+12`
  - ステージ2: `+20`
  - ステージ3: `+36`
  - ステージ4: `+56`
  - ステージ5: `+84`
  - ステージ6: `+120`

- 背景画像:
  - `src/assets/register-game-bg.png`
- 読み上げ速度:
  - `0.5x / 1x / 1.5x / 2x / 5x / 10x`
  - 選択値は `registerPlayConfig.readingSpeed` として保存し、再訪時に復元する

### 科目ごとの扱い

- みとり:
  - 問題行を順次読み上げ
  - レシート表示に整形（商品名はゲーム用固定名）
- かけ:
  - 問題文を会話表示
  - 試験形式の式領域も表示
- わり:
  - 余り入力はなし（商のみ）
  - ボタン文言は「ひとりぶんをつたえる」

## 5.3 ShopPage / ShopPaymentPage

ファイル:
- `src/features/soroban/views/ShopPage.tsx`
- `src/features/soroban/views/ShopPaymentPage.tsx`

- 固定商品配列は `src/features/soroban/catalog.ts`
- `ShopPage` は商品一覧のみを担当し、商品選択で `#/soroban/shop/payment/:itemId` へ遷移
- `ShopPage` は画面遷移直後に犬の吹き出しで「いらっしゃいませ！」を表示してから商品一覧を表示する
- `ShopPage` でゲームTOPへ戻る時は、犬の吹き出しで「ありがとうございました！」を表示してから遷移する
- 購入成功後に一覧へ戻る際は、犬の吹き出しで「おかいあげありがとうございます！」を表示してから商品一覧を表示する
- ショップ導線のしばいぬセリフは辞書管理し、固定確率（20%）でレア台詞を出す
- ショップ導線のセリフは直前と同一文言の連続表示を避ける
- 商品購入完了時は商品IDごとのユニークセリフを表示する
- レジゲーム中のしばいぬ正誤セリフ（「ありがとう！」「ちがうよ」）は固定のまま変更しない
- `ShopPaymentPage` は支払い操作（投入/判定）を担当
- 棚段解放アイテム（上段/下段）をショップで購入できる
- 支払いトレー:
  - `500 / 100 / 50 / 10 / 5 / 1`
- 財布に表示される各額面の枚数は所持コインから算出し、投入すると減る/戻すと増える
- 価格以上の所持コインがある場合、初期財布は対象価格をぴったり払える枚数構成を必ず含む
- 価格未満なら購入不可、所持コイン不足でも不可
- おつりは表示のみ（MVP）
- ぴったり支払い時は商品価格の10%をコインで還元する
- 画像欠損時はかな表記のプレースホルダーを表示
- ゲーム導線（register/shop/shelf）の画面文言は、ひらがな・カタカナのみで表示する

## 5.4 ShelfPage

ファイル: `src/features/soroban/views/ShelfPage.tsx`

- 背景は `src/assets/shelf.png` を使用し、ゲームTOPに近い全画面レイアウトで表示
- 初期表示は通常モード（閲覧）で、未解放オーバーレイとアイテム名ラベルは表示しない
- 「へんしゅう」ボタン押下で編集モードに入り、配置編集を有効化する
- 棚スロットをタップすると、購入済みグッズ選択モーダルを表示
- 空き/配置済みを問わず、スロットタップで対象スロットを選んでモーダルを開く
- モーダルでグッズを選ぶと、対象スロットに即時配置する
- 配置済みスロットを開いたモーダルでは「このばしょから はずす」で対象スロットのみ解除できる
- 棚スロットは3行固定で、背景棚を活かすため透明パネル中心の表示にする
- 初期状態は中段のみ使用可能
- 上段/下段はショップの解放アイテム購入後に使用可能
- 未解放段は編集モード時のみオーバーレイで「みかいほう」を表示
- 同一グッズは棚内で同時に1個のみ（別スロットへ置いた場合は移動扱い）
- 別グッズが置かれているスロットへは上書き配置
- 既存の行/列拡張UIは使用しない（データ構造は保持）
- 画像欠損時プレースホルダー表示

## 5.5 RegisterAdminPage（管理者画面）

ファイル: `src/features/soroban/views/RegisterAdminPage.tsx`

- 役割:
  - `learning-arcade:soroban-state` のJSONを直接編集
  - JSON妥当性チェック後に保存
  - 再読込で現在値を再取得
- 現在は暫定でパスワードなし
- 遷移は `#/soroban/admin` を直接開く運用（ゲームTOPには専用ボタンを置かない）

## 5.6 SnackBudgetGamePage（300円おやつゲーム）

ファイル: `src/features/soroban/views/SnackBudgetGamePage.tsx`

- 役割:
  - スーパーの棚を模した商品カードを表示
  - 商品カードをドラッグ＆ドロップしてカゴへ追加
  - カゴ内で個数増減・クリアを実行
  - 「おかいけい」押下時にのみ合計と判定結果を表示
- 学習要件:
  - プレイ中は合計金額・残金額を表示しない（暗算目的）
  - 会計時に `300円` との差額とオーバー有無を表示する

## 6. 共通UI

`src/features/soroban/components/SceneFrame.tsx`

- 背景1枚 + オーバーレイ構造
- `outsideTopLeft` に画像外の戻るボタン等を配置
- 背景画像欠損時はグラデ背景へフォールバック

## 7. adminモード

- 環境変数: `VITE_REGISTER_ADMIN_MODE`
  - truthy: `1`, `true`, `on`
- 影響:
  - `App.tsx` でグローバル `ADMIN MODE` バッジ表示
  - `views/RegisterGamePage.tsx` で「こたえをにゅうりょく」ボタン表示
- 起動用スクリプト:
  - `package.json` の `dev:admin`

## 8. 既知の制約・実装ルール

- レイアウト最適化の基準は **iPad Air 2 の横画面** とし、`1024x768`（CSS px / 実解像度 `2048x1536`）をベースに主要UIが破綻しないことを必須とする
- 実運用は Safari 表示を前提とし、ブラウザヘッダ/ツールバーぶんで実効高さが減るため、**高さは 700px 想定** で主要UIが欠けないこと
- 現在 UI からは `zenshugakuren` のみ選択可（他団体ロジックは残置）
- ゲーム中の見た目は会話優先で、試験用表示領域は必要時のみ出す
- 出題自体は必ず `practiceConfig` + `generateProblems` の再利用を維持する

## 9. 改修時の推奨手順

1. `state.ts` で保存形式互換を維持（既存キーを増やしすぎない）
2. `RegisterTopPage` で選択可能範囲を制御
3. `RegisterGamePage` は「出題値そのまま・表示のみ変換」を守る
4. 変更後は `npm run build` を通す
