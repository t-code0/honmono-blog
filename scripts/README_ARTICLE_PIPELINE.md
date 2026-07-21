# 記事自動生成パイプライン（Claude Codeサブスク枠・API課金0円）

作成日: 2026-07-22

従来の `src/app/api/cron/generate-article` は `@anthropic-ai/sdk` 経由で
Anthropic API を叩くため**従量課金**が発生する（これが停止理由）。
こちらは `claude` CLI のヘッドレスモード（`claude -p`）を使うため、
Claude Code のサブスク枠で動き **API課金は発生しない**。

---

## 構成

| ファイル | 役割 |
|---|---|
| `scripts/sql/blog_keyword_queue.sql` | キーワード30件のINSERT＋任意DDL＋運用SQLスニペット |
| `scripts/generate_article.mjs` | 本体。キーワード取得→生成→下書き保存 |
| `scripts/run_generate_article.ps1` | タスクスケジューラ用ラッパー（二重起動防止） |
| `scripts/TaskScheduler_HonmonoArticle.xml` | タスクスケジューラ登録用XML（UTF-16） |
| `scripts/drafts/` | 生成された下書きMarkdown（git管理外・人間が読む用） |
| `scripts/logs/` | 実行ログ 日付別（git管理外） |

### 処理の流れ

1. `blog_keywords` から `status='pending'` を `priority` 昇順で1件取得
2. 同カテゴリの既存記事3本を読み込み、文体の参考としてプロンプトに含める
3. `claude -p --model sonnet` で本文生成（サブスク枠）
4. `scripts/drafts/<slug>.md` にローカル保存（人間が読むため）
5. `blog_articles` に **`status='draft'`** でINSERT
6. キーワードを消費済みに更新
7. `blog_generation_logs` に記録（`cost_jpy=0`）

**記事は自動公開されません。** 公開は人間が承認してから（下記）。

---

## ⚠️ ANTHROPIC_API_KEY について

`.env.local` には `ANTHROPIC_API_KEY` が入っている。
この環境変数が `claude` CLI に渡ると**従量課金APIに切り替わってしまう**ため、
`generate_article.mjs` は子プロセスの環境から明示的に削除している。

```js
function buildChildEnv() {
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  delete env.ANTHROPIC_AUTH_TOKEN;
  delete env.ANTHROPIC_BASE_URL;
  return env;
}
```

**この処理は絶対に消さないこと。** 消すと知らないうちに課金が始まる。

---

## 手動実行

```powershell
cd C:\Users\Owner\Documents\アプリ開発\honmono-blog

# 生成だけしてSupabaseには書かない（動作確認用）
node scripts/generate_article.mjs --dry-run

# 1本生成してSupabaseに下書き保存
node scripts/generate_article.mjs

# 3本まとめて
node scripts/generate_article.mjs --count 3

# ラッパー経由（当日実行済みならスキップ／-Force で強制）
powershell -ExecutionPolicy Bypass -File scripts\run_generate_article.ps1
powershell -ExecutionPolicy Bypass -File scripts\run_generate_article.ps1 -Force
```

所要時間は1本あたり約60〜80秒。

---

## タスクスケジューラ登録手順

### 方法A: XMLをインポート（推奨）

管理者権限は不要。PowerShellで:

```powershell
schtasks /create /tn "HONMONO\GenerateArticle" /xml "C:\Users\Owner\Documents\アプリ開発\honmono-blog\scripts\TaskScheduler_HonmonoArticle.xml"
```

登録内容:
- **PC起動の5分後**に1回実行（BootTrigger + LogonTrigger、いずれもDelay 5分）
- 二重起動防止は2段構え
  - `MultipleInstancesPolicy=IgnoreNew`（同時実行を防ぐ）
  - `scripts/logs/last_run.txt` の日付スタンプ（当日実行済みならスキップ）
- 実行時間上限1時間、ネットワーク利用可能時のみ実行

### 方法B: GUIで登録

1. タスクスケジューラを開く
2. 「タスクのインポート」→ 上記XMLを選択

### 登録確認・削除

```powershell
schtasks /query /tn "HONMONO\GenerateArticle" /v /fo list   # 確認
schtasks /run   /tn "HONMONO\GenerateArticle"               # 手動即実行
schtasks /delete /tn "HONMONO\GenerateArticle" /f           # 削除
```

### 二重起動防止の仕組み

`run_generate_article.ps1` は成功時に `scripts/logs/last_run.txt` へ当日の日付を書く。
次回起動時、日付が当日と一致すればスキップする。

- **失敗した日はスタンプを更新しない** → 次回起動時に自動リトライされる
- `--dry-run` はスタンプを更新しない → 本番実行を妨げない
- 強制実行は `-Force`

---

## 承認フロー（下書き → 公開）

管理画面は**あえて作っていない**。理由は、公開操作ができる画面を作ると
認証を実装しない限り誰でも公開できてしまい、認証を入れると工数が跳ね上がるため。
記事は1日1本ペースなので、下記の運用で十分と判断した。

### 1. 下書きを読む

生成時に `scripts/drafts/<slug>.md` へ保存されるので、
**エディタでそのまま読める**（Supabase Studioのセル内で3000字を読むのは非現実的）。

### 2. 公開する

Supabase SQL Editor で:

```sql
-- 下書き一覧
SELECT id, slug, category, title, LENGTH(content_md) AS chars, created_at
FROM blog_articles WHERE status = 'draft' ORDER BY created_at DESC;

-- 公開
UPDATE blog_articles
SET status = 'published', published_at = NOW(), updated_at = NOW()
WHERE id = <ID>;
```

### 3. 破棄する場合

```sql
UPDATE blog_articles SET status = 'archived' WHERE id = <ID>;
-- キーワードをキューに戻す
UPDATE blog_keywords SET status = 'pending', published_at = NULL
WHERE id = (SELECT keyword_id FROM blog_articles WHERE id = <ID>);
```

公開サイトは `status='published'` のみを表示する（`src/lib/articles.ts`）。
RLSでも anon ロールは published しか読めないため、**下書きが漏れることはない**（実測確認済み）。

---

## アフィリエイトリンクについて

記事末尾に以下の形式で**挿入位置の提案だけ**が入る。リンク自体は人間が入れる。

```html
<!-- AFFILIATE_SUGGESTIONS
- 見出し「〇〇」の直後: （商材カテゴリと理由）
-->
```

公開前にこのコメントを削除し、実際のリンクに差し替えること。

---

## トラブルシューティング

### `claude` が見つからない

タスクスケジューラは PATH が異なる場合がある。`where claude` で確認し、
必要なら `generate_article.mjs` の `spawn` をフルパスに変更する。

### 生成が短い / 品質が低い

`buildPrompt()` の「## 文字数（重要）」節を調整する。
1500字未満は自動的に保存が中止される（壊れた出力を弾くため）。
2500字未満は警告のみ出して保存されるので、下書きを見て判断する。

### キーワードが尽きた

```sql
SELECT COUNT(*) FROM blog_keywords WHERE status = 'pending';
```

`scripts/sql/blog_keyword_queue.sql` の形式で追加INSERTする。
既存の自動補充（`replenishKeywordsIfNeeded`）はAPI課金が発生するので使わないこと。

### 課金が発生していないか確認したい

ログに `model: claude-cli:sonnet` / `cost_jpy: 0` で記録される。
`@anthropic-ai/sdk` 経由なら `claude-haiku-4-5-...` と実コストが入る。
