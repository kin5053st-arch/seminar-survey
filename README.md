# セミナーアンケート デプロイ手順

このリポジトリはNMR流通総合研究所の無料セミナー用アンケートフォーム（サプライチェーン対策評価制度版）を Vercel + GAS でホストする構成です。

## 構成

```
seminar-survey/
├── public/
│   ├── index.html       ← アンケートフォーム本体
│   └── nmr-logo.png     ← ロゴ画像
├── gas/
│   └── Code.gs          ← Google Apps Script コード（手動でGASに貼り付け）
├── vercel.json          ← Vercel 設定
└── README.md
```

データフロー: **HTML フォーム → POST → GAS Web App → Google Spreadsheet**

- 送信先 Spreadsheet: `1MWEoV-y-LuTD4rIT--XFsqQ1OlhXLsYflc8QzoeW8Zo`
- 対象シート gid: `1307953343`
- 無料相談の予約 CTA: TimeRex (`https://timerex.net/s/nmrshachou_7eef/8288e300`)

---

## ① GAS Web App のデプロイ

新スプレッドシートに紐付ける GAS Web App を **最初に** デプロイする必要があります。

### 手順

1. https://script.google.com/ にアクセスし「新しいプロジェクト」を作成
2. プロジェクト名を `seminar-survey-supplychain` 等に変更
3. `gas/Code.gs` の内容を全コピーして、エディタ上の `Code.gs` に貼り付け
4. 保存（Ctrl+S）
5. 動作確認: 関数選択で `testAppendRow` を選んで「実行」 → 初回は権限承認ダイアログが出るので許可
6. スプレッドシートに1行テストデータが追加されることを確認
7. 右上「デプロイ」→「新しいデプロイ」
8. 種類: **ウェブアプリ**
9. 説明: `seminar-survey supply chain v1` 等
10. 実行ユーザー: **自分**
11. アクセスできるユーザー: **全員**（匿名POSTを許可）
12. 「デプロイ」→ 発行された **ウェブアプリ URL** をコピー（`https://script.google.com/macros/s/.../exec`）

### コードを更新したい場合

GAS エディタで編集後、「デプロイ」→「デプロイを管理」→ 既存デプロイ右の鉛筆 → バージョン「新バージョン」→ デプロイ。
※新しい URL は払い出されないので、`index.html` 側の修正は不要です。

---

## ② index.html に GAS URL を貼り付け

`public/index.html` 内の以下の行を編集します:

```javascript
const GAS_URL = 'YOUR_NEW_GAS_WEB_APP_URL_HERE';
```

↓

```javascript
const GAS_URL = 'https://script.google.com/macros/s/コピーしたURL/exec';
```

---

## ③ Vercel デプロイ

### 方法A：GitHubリポジトリ経由（推奨）

既に `kin5053st-arch/seminar-survey` リポジトリは Vercel と連携済みのため、`main` ブランチへ push すると自動再デプロイされます。

1. ローカル変更を `git add` / `git commit`
2. `git push origin main`
3. Vercel ダッシュボードで再デプロイ完了を確認
4. 公開 URL でフォーム表示確認

新規にリポジトリを作る場合:
1. https://github.com/new でリポジトリ作成
2. `public/` フォルダと `vercel.json` をアップロード
3. https://vercel.com で「Add New」→「Project」→ リポジトリを Import → Deploy

### 方法B：Vercel CLI で直接デプロイ

```bash
npm install -g vercel
vercel login
cd seminar-survey
vercel --prod
```

---

## デプロイ後の確認チェックリスト

### 必須確認
- [ ] Vercel URL にアクセスしてフォームが表示される
- [ ] 必須項目バリデーション（会社名・お名前・業種・参加理由・満足度・参考になったこと・もっと知りたいこと）が動作する
- [ ] テスト送信して、Spreadsheet (`1MWEoV-y-LuTD4rIT--XFsqQ1OlhXLsYflc8QzoeW8Zo` / gid=1307953343) に1行追加される
- [ ] 「9項目診断_スコア（/9）」列に 0〜9 の整数が入る
- [ ] サンクス画面の TimeRex CTA が新規タブで `https://timerex.net/s/nmrshachou_7eef/8288e300` を開く

### モバイル確認
- [ ] iOS Safari / Android Chrome で表示崩れなし
- [ ] チェックボックス・ラジオがタップしやすい

### 列順
GAS の `COLUMNS` 定数（`gas/Code.gs`）と `index.html` の `collectFormData()` は順序を揃えてください。15列構成です。

---

## トラブルシューティング

| 症状 | 対応 |
|---|---|
| Spreadsheet に書き込まれない | GAS Web App の「アクセスできるユーザー」が「全員」になっているか確認 |
| `Authorization required` エラー | `testAppendRow` を一度実行して権限承認 |
| 列がずれている | `COLUMNS` 配列と `appendRow` の引数順を確認 |
| GAS URL を変更した | `index.html` の `GAS_URL` を更新して Vercel 再デプロイ |
