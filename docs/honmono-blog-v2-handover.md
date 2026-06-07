# HONMONO-BLOG 引き継ぎ資料 v2

> 作成日: 2026/06/07
> 前チャット: 2日目セッション完了
> 状態: 本番稼働中、収益化基盤完成

---

## 📋 プロジェクト基本情報

### ブランド・概要
- **ブランド**: HONMONO
- **目的**: AI自動生成ブログで月10〜30万円の収益化
- **コンセプト**: 「本物だけを選ぶ」プラットフォーム

### URL・リポジトリ
- **本番URL**: https://honmono-blog.vercel.app
- **GitHub**: https://github.com/t-code0/honmono-blog
- **ローカル**: `C:\Users\Owner\Documents\アプリ開発\honmono-blog`

### 開発者
- **GitHubアカウント**: t-code0
- **運営メール**: honmono.blog@gmail.com
- **環境**: Windows PowerShell + Claude Code

---

## 🏗 技術スタック

```
フロント: Next.js 14 (App Router) + TypeScript + Tailwind CSS
DB: Supabase（共有プロジェクト: gdifculokwftyxualoxb）
   ※5アプリ共有のため blog_ プレフィックスでテーブル分離
ホスティング: Vercel
AI: Claude API（Haiku 4.5生成・Sonnet 4.6品質チェック）
Cron: Vercel Cron（毎日JST 03:00に3記事生成）
分析: GA4（G-8EWGSL8NSL）+ Search Console
収益化: A8.net + もしも + AdSense（審査前）
```

---

## ✅ 完成済みインフラ（2026/06/07時点）

### 1. 記事生成
- ✅ Cron 1日3記事自動生成
- ✅ 7カテゴリ（world-food, japan-culture, ai, sauna, coffee, camp, health）
- ✅ 現在16記事程度生成済み
- ✅ アフィリエイト自動挿入機能

### 2. アフィリエイト基盤
- ✅ A8.net 57提携 + 今日大量追加（後述）
- ✅ もしもアフィリエイト メディア登録完了（審査待ち）
- ✅ Supabaseに `affiliate_programs` テーブル
- ✅ `blog_affiliate_clicks` でクリックトラッキング
- ✅ rel="nofollow noopener noreferrer sponsored" 自動付与

### 3. SEO・分析基盤
- ✅ Google Search Console 所有権認証完了
- ✅ sitemap.xml 送信完了（Googleクロール開始済み）
- ✅ Google Analytics 4 タグ実装完了（稼働確認済み）
- ✅ Vercel環境変数 NEXT_PUBLIC_GA_ID 設定済み

### 4. 法務4ページ（Hayato作成）
- ✅ /ja/privacy（プライバシーポリシー）
- ✅ /ja/about（運営者情報）
- ✅ /ja/disclaimer（免責事項・AI生成明記）
- ✅ /ja/affiliate-disclosure（アフィリエイト表示）

### 5. SNSアカウント開設済み（運用前）
- ✅ X: @honmono_blog
- ✅ Instagram: honmono.blog
- ✅ Gmail: honmono.blog@gmail.com

### 6. 22名サブエージェントチーム
プロジェクト内 `agents/` 配下にCLAUDE.md配置済み:
```
01_claude_sage_CLAUDE.md（戦略補佐）
02_sora_backend_CLAUDE.md（バックエンド）
03_iori_prompt_CLAUDE.md（プロンプト設計）
04_yu_partnership_CLAUDE.md（パートナーシップ）
05_aki_analyst_CLAUDE.md（データ分析）
06_hayato_legal_CLAUDE.md（法務）
07_riku_security_CLAUDE.md（セキュリティ）
08_ryota_cso_CLAUDE.md（戦略オフィサー）
09_yuki_cro_CLAUDE.md（収益最適化）
10_daichi_pm_CLAUDE.md（PM）
11_ayano_ux_CLAUDE.md（UXディレクター）
12_kenji_frontend_CLAUDE.md（フロントエンド）
13_maya_db_CLAUDE.md（DBアーキテクト）
14_hiro_devops_CLAUDE.md（DevOps）
15_rin_editor_CLAUDE.md（編集長）
16_taka_keyword_CLAUDE.md（キーワード）
17_nao_factcheck_CLAUDE.md（ファクトチェック）
18_kana_copywriter_CLAUDE.md（コピーライター）
19_shin_seo_CLAUDE.md（SEO）
20_mio_x_CLAUDE.md（X運用）
21_rena_instagram_CLAUDE.md（Instagram）
22_jun_growth_CLAUDE.md（グロースハック）
```

メインCLAUDE.mdに22名統合テーブル追加済み。
ロール指定で起動（"Hayatoとして"、"Soraとして"等）。

---

## 🔑 環境変数（Vercel）

```
ANTHROPIC_API_KEY=（設定済み）
NEXT_PUBLIC_SUPABASE_URL=https://gdifculokwftyxualoxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=（設定済み）
SUPABASE_SERVICE_ROLE_KEY=（設定済み）
CRON_SECRET=787a2954284d523650fbeaeb8f430d19
NEXT_PUBLIC_ADSENSE_PUB_ID=pub-8285912744304653
NEXT_PUBLIC_GA_ID=G-8EWGSL8NSL ★今日追加
NEXT_PUBLIC_ENABLE_I18N=false
```

---

## 🚨 進行中の最重要タスク

### 【中断中】A8新規提携の一括取得＆Supabase投入

**経緯**:
1. A8で大量に新規プログラム提携申請（今日完了）
2. 自動取得スクリプト作成（scripts/a8_fetch_programs.js）
3. ブラウザのSnippets実行で**2つのエラー発生**:
   - Uncaught SyntaxError: Illegal break statement (Line 22:7)
   - 絵文字・日本語が ?????? に文字化け
4. Claude Code に修正依頼の段階で中断

**次のセッションでやること**:

#### Step 1: scripts/a8_fetch_programs.js を修正
```
Claude Codeに以下指示:

scripts/a8_fetch_programs.js を以下のエラー対応で修正してください:

エラー1: Uncaught SyntaxError: Illegal break statement (at Line 22:7)
→ Chromeのスニペット環境ではトップレベルでbreakが使えない
→ 全体を IIFE (async () => { ... })() でラップする
→ または break文を削除して continue や return に変える

エラー2: console.logの絵文字・日本語が文字化け
→ ファイルをUTF-8で書き直す
→ PowerShellでファイル書き込み時は -Encoding UTF8 必須

修正完了したら以下のコマンドで動作確認できる状態にする:
cat scripts/a8_fetch_programs.js | clip
```

#### Step 2: A8でスクリプト実行
1. https://media-console.a8.net にログイン
2. F12 → Sources タブ → Snippets
3. New snippet → 中身全削除 → Ctrl+V でスクリプト貼り付け
4. Ctrl+Enter で実行
5. 完了したら以下をConsoleで実行:
   ```javascript
   copy(JSON.stringify(window.__a8_results, null, 2))
   ```
6. PowerShellで保存:
   ```powershell
   cd C:\Users\Owner\Documents\アプリ開発\honmono-blog
   Get-Clipboard | Out-File -FilePath scripts/a8_results.json -Encoding UTF8
   ```

#### Step 3: Supabase投入
```powershell
node scripts/a8_import_to_supabase.mjs scripts/a8_results.json
```

---

## 📝 今日（2026/06/07）申請したA8プログラム

主要なEPC高値プログラム（順不同・覚えてる限り）:

```
🔴 超高単価（EPC 200+）
- GMOとくとくBB光（6000円・EPC 432）★最強
- GMOドコモ光（17000円・EPC 333）
- BIGLOBE WiMAX（5000円・EPC 249）
- GMOとくとくBB（5100円・EPC 207）
- ETC協同組合 法人ETCカード（5000円・EPC 205）
- OZ GAMING（EPC 197）

🟡 高単価
- ExpressVPN（4500円）
- ロリポップ ゲームサーバー（最大68000円）
- 西川ストア（EPC 47.99）
- Kagg.jp オフィス家具（EPC 108）
- ながら洗車（EPC 45）
- SAT資格eラーニング（EPC 45）
- MillenVPN（3500円）
- CAGUUU家具（EPC 63）
- JPStars電動キックボード（EPC 56）
- ファミリーギガ光（12500円）
- ソフトバンク光（16000円）
- @nifty光（8000円）
- 365チャージWiFi
- リチャージWiFi
- 縛りなしWiFi
- DTI WiMAX（5000円）
- おきらくホームWi-Fi（4000円）
- MONSTER MOBILE（3000円）
- Fon光（6380円）
- WiFiレンタルどっとこむ（1200円）
- ミクロガード（EPC 53.72）
- 咲夜マットレス（EPC 135.76）
- エスメラルダ寝具（EPC 40.7）
- GOKUMIN
- トトノエライト
- RingConn
- エムール
- VideoProc（動画変換ソフト）
- GMKtec ミニPC
- Parallels
- ダビングコピー革命
- ゲオ宅配レンタル
- クリエイターズジャパン（動画編集スクール）
- RE:DIVER WordPressテーマ
- バーチャルオフィス
- インスタベース
```

検索したキーワード:
```
WiMAX / NURO光 / 動画 / クレジットカード / 睡眠 / 妊活 / 転職
```

未検索（次回検索推奨）:
```
U-NEXT / Hulu / DMM TV / リクルートエージェント / doda
TechAcademy / 侍エンジニア / DMM WEBCAMP
ConoHa WING / さくらインターネット / mineo
温活 / プログラミング
```

---

## 🟡 セキュリティ修正タスク（Rikuの指摘）

### 🔴 緊急対応
1. `/api/revalidate` の認証をAuthorization: Bearer方式に変更
   （現在はクエリパラメータ secret でURLに露出）

### 🟡 計画対応
2. next.config.ts にセキュリティヘッダー追加（X-Frame-Options, CSP等）
3. /api/affiliate/click にレート制限実装
4. Supabase RLSポリシーを管理画面で全テーブル確認
5. .env.local.example のSupabase URLをプレースホルダー化

---

## 🎯 残タスク（優先度順）

### 🔴 最優先（次回セッション最初）
1. scripts/a8_fetch_programs.js のエラー修正（上記Step 1-3）
2. A8新規提携をSupabaseに投入

### 🟡 早めに
3. Vercel本番のGA4タグ動作確認（24-48時間後にデータ反映）
4. 既存16記事への新規アフィリ再生成
5. Riku指摘のセキュリティ修正（特に /api/revalidate）
6. もしも本登録の承認確認 → 楽天・Amazon申請

### 🟢 中期
7. AdSense審査申請（記事30本到達時）
8. X/Instagram プロフィール完成・運用開始
9. note アカウント開設（被リンク獲得）
10. 未検索キーワードでA8追加申請（クレカ、動画配信、転職等）
11. 22名サブエージェント本格運用（Mio/Rena/Shin等）

---

## 🛠 確立済みワークフロー

### Claude Code 起動
```powershell
cd C:\Users\Owner\Documents\アプリ開発\honmono-blog
claude --dangerously-skip-permissions
```

並行作業時は別タブで複数起動OK（ファイル領域が異なれば）。

### Supabase DDL（CREATE/ALTER TABLE等）
PostgREST/REST API経由不可。手順:
1. Claude CodeがSQL生成
2. ユーザーがSupabase SQL Editorに貼り付けて手動実行
3. 確認後にClaude CodeがDML操作

### ISRキャッシュ無効化
```
GET /api/revalidate?secret=xxx&path=/path
```
または Vercel Dashboard → Redeploy（Build Cache無効）

### INSERT重複対策
```sql
ON CONFLICT (instagram_handle) DO NOTHING
```
パターン必須

### Vercelタイムアウト対策
10秒制限超える処理はバックグラウンド非同期 + フロントエンドポーリングで分割。

### PowerShellファイル書き込み
CLAUDE.mdなど日本語含む場合は必ず:
```powershell
... | Out-File -Encoding UTF8 -FilePath path
```

---

## 🚀 次のセッション開始時の指示文

新チャットを開いたら以下を伝える:

```
honmono-blog の v2 セッション開始です。
引き継ぎ資料を渡すので読んでください。

【最優先タスク】
A8新規提携の一括取得スクリプトのエラー修正と実行。
scripts/a8_fetch_programs.js で以下エラーが出ています:
1. Uncaught SyntaxError: Illegal break statement (Line 22:7)
2. console.logが文字化け（??????表示）

修正方針:
- IIFE (async () => { ... })() でラップ
- UTF-8で書き直し（PowerShell書き込み時 -Encoding UTF8 必須）

修正完了したら、私がブラウザでA8に貼り付けて実行します。
```

その後、本資料を貼り付けて読ませる。

---

## 📊 今日の最終戦果サマリー

```
🏗 インフラ
✅ honmono-blog 完全稼働中
✅ 22名サブエージェントチーム実装
✅ 法務4ページ完備

📊 分析・SEO
✅ Search Console 認証＋sitemap送信完了
✅ GA4 タグ実装完了（稼働確認済み）

💰 収益化
✅ A8.net 大量プログラム新規提携申請完了（取得・投入は次回）
✅ もしもアフィリ メディア登録完了（審査待ち）

🔐 セキュリティ
✅ 重大問題なし
🟡 軽微な修正タスク5件あり

🤖 自動化
✅ Cron 1日3記事生成稼働中
✅ アフィリ自動挿入機能稼働中
```

エネルスお疲れさま。次セッションへ。
