# HONMONO-BLOG Phase 1 サブエージェント 7名

> Claude Code で `honmono-blog` プロジェクトを効率的に運用するためのサブエージェント定義
> 2026/06/07 v1.1（法務・セキュリティ追加）

---

## 📦 含まれるエージェント

| # | 名前 | 役職 | ファイル |
|---|---|---|---|
| 01 | **Claude-Sage** | 戦略補佐 | `01_claude_sage_CLAUDE.md` |
| 02 | **Sora** | バックエンド | `02_sora_backend_CLAUDE.md` |
| 03 | **Iori** | プロンプト設計 | `03_iori_prompt_CLAUDE.md` |
| 04 | **Yu** | パートナーシップ | `04_yu_partnership_CLAUDE.md` |
| 05 | **Aki** | データアナリスト | `05_aki_analyst_CLAUDE.md` |
| 06 | **Hayato** | 法務・コンプライアンス | `06_hayato_legal_CLAUDE.md` 🆕 |
| 07 | **Riku** | セキュリティオフィサー | `07_riku_security_CLAUDE.md` 🆕 |

---

## 🚀 セットアップ

### ステップ1: ファイル配置

PowerShellで以下を実行：

```powershell
cd C:\Users\Owner\Documents\アプリ開発\honmono-blog
mkdir -p agents

# ダウンロードしたファイルを agents/ にコピー
# （ファイル名のCLAUDE.mdをそのまま使う）
```

ディレクトリ構成：

```
honmono-blog/
├── CLAUDE.md  ← CEO指示書（既存）
├── agents/    ← 新規
│   ├── 01_claude_sage/
│   │   └── CLAUDE.md
│   ├── 02_sora_backend/
│   │   └── CLAUDE.md
│   ├── 03_iori_prompt/
│   │   └── CLAUDE.md
│   ├── 04_yu_partnership/
│   │   └── CLAUDE.md
│   └── 05_aki_analyst/
│       └── CLAUDE.md
```

または、シンプルに `agents/` フォルダ直下に5ファイル並べてもOK。

### ステップ2: メインCLAUDE.mdに追記

`honmono-blog/CLAUDE.md` の末尾に以下を追加：

```markdown
---

## 🤖 サブエージェント呼び出し

Phase 1 として以下5名を起動可能：

| 起動キーワード | 役割 | 定義ファイル |
|---|---|---|
| "Claude-Sageとして" | 戦略補佐 | `agents/01_claude_sage_CLAUDE.md` |
| "Soraとして" | バックエンド開発 | `agents/02_sora_backend_CLAUDE.md` |
| "Ioriとして" | プロンプト設計 | `agents/03_iori_prompt_CLAUDE.md` |
| "Yuとして" | パートナーシップ管理 | `agents/04_yu_partnership_CLAUDE.md` |
| "Akiとして" | データ分析 | `agents/05_aki_analyst_CLAUDE.md` |

各エージェントの定義ファイルを必ず読んでからロールを引き受けること。
```

---

## 💡 使い方の例

### 例1: 普通のタスク依頼

```
「アフィリエイト挿入のバグ修正して」
```

### 例2: 役割明示で依頼

```
「Soraとして、Cronの失敗時リトライを実装して」
↓
Soraの責任範囲・スキル・KPIに沿って動く
```

### 例3: 複数エージェントで連携

```
「Yuに新ASP探させて、見つかったらMayaにSQL投入依頼して」
↓
Yu → 探索 → SQL生成 → Maya（既定義の場合）に渡す
```

### 例4: 戦略相談

```
「Claude-Sageに相談、1日5記事に増やすか判断して」
↓
オプションA/B/C提示 → 推奨 → 次のアクション
```

---

## 🎯 各エージェントの特徴

### Claude-Sage（戦略補佐）
- **強み**: 全体俯瞰、意思決定補助、3オプション提示
- **使うべき時**: 重要な判断、優先順位迷う時、新機能検討

### Sora（バックエンド）
- **強み**: API実装、Claude API統合、コスト最適化
- **使うべき時**: APIバグ、Cron不調、新機能実装

### Iori（プロンプト設計）
- **強み**: 記事品質UP、コスト削減、カテゴリ別最適化
- **使うべき時**: 記事の質に違和感、コスト増、新カテゴリ立ち上げ

### Yu（パートナーシップ）
- **強み**: ASP管理、A8自動取得スクリプト、SQL生成
- **使うべき時**: 新提携獲得、カテゴリの穴埋め、提携の整理

### Aki（データ分析）
- **強み**: SQLクエリ、レポート作成、インサイト発見
- **使うべき時**: 週次/月次レポート、パフォーマンス分析、判断データ提供

---

## 📞 起動の優先順位

```
タスクの内容で振り分け：

🤔 「どうしよう、迷う」      → Claude-Sage
🛠 「コード書いて」          → Sora
✍️ 「記事の質が」            → Iori
💰 「アフィリ管理」          → Yu
📊 「数字見せて」            → Aki
⚖️ 「法的に大丈夫？」        → Hayato
🔐 「セキュリティ心配」      → Riku
```

迷ったら **Claude-Sage** に投げれば、適切なエージェントに振り分けてくれる。

---

## 🔄 連携フロー例（実運用）

### 例A: 新カテゴリ「ニッポン再発見」を追加したい

```
1. Claude-Sage に「新カテゴリ立ち上げ検討」
   → 市場性・コスト・優先度を提示
   
2. エネルスさんが GO 判断
   
3. Taka（Phase 2予定）にキーワード20個発掘
   ※ Phase 1ではエネルスさん自身で
   
4. Iori にプロンプト作成
   
5. Sora にDB登録＆Cron対応
   
6. Yu に関連ASPカテゴリ追加
   
7. Aki に週次モニタリング設定
```

### 例B: 記事の品質が落ちた気がする

```
1. Claude-Sage に「品質低下の調査」依頼
   
2. Aki に過去30日の品質指標集計
   
3. Iori にプロンプトレビュー
   
4. 改善版プロンプトをA/Bテスト
   
5. 結果を Claude-Sage に報告 → 採用判断
```

---

## ⚠️ 注意点

### 1. エージェントは「人格」ではなく「役割」
各エージェントはあくまでロール定義。同じClaudeが切り替えて演じる。

### 2. CLAUDE.mdは必ず読む
Claude Code が新規セッションで各エージェントを起動する際、必ず定義ファイルを `view` してから始めること。

### 3. エネルスさんは CEO
最終判断は全てエネルスさん。エージェントは提案・実行担当。

### 4. Phase拡張
収益や記事数が一定到達したら Phase 2（SNS関連）追加：
- Mio（X）
- Rena（Instagram）
- Shin（SEO）

---

## 🎁 ボーナス: クイック起動コマンド集

```bash
# よく使うコマンド集

# Claude-Sageに相談
echo "Claude-Sageとして、〇〇について意思決定補佐して"

# Soraにタスク
echo "Soraとして、〇〇を実装して。完了後CHECK層として確認まで"

# Ioriにプロンプト改善
echo "Ioriとして、〇〇カテゴリのプロンプト見直して。A/Bテスト案も"

# Yuに新ASP発掘
echo "Yuとして、〇〇カテゴリのASP3つ発掘して。EPC順で"

# Akiに週次レポート
echo "Akiとして、先週の週次レポート提出して。フォーマットは定義通り"
```

---

## 📈 Phase 2 / 3 の展望

```
Phase 2（記事30本以降）
- Mio (X 運用)
- Rena (Instagram運用)
- Shin (SEO本格化)

Phase 3（収益化軌道後）
- Rin (編集長)
- Taka (キーワード戦略)
- Jun (グロースハック)

最終形（20名フル稼働）
全レイヤー完全分業
```

---

## 🤝 おわりに

このチーム編成は **honmono-blog を月50万円規模に成長させる** ための設計。
エネルスさんは「意思決定」と「最終承認」に集中し、実務は各エージェントが担う。

困ったら **Claude-Sage** に相談してね。

— Claude-Sage より
