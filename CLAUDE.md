## 作業開始前の必須手順（新規タスク開始時のみ）
1. CLAUDE.md を読む（このファイル）
2. プロジェクトファイルの CLAUDE_CEO_v9.md を読む
3. プロジェクトファイルの quality_gates_v9.md を読む
4. .env.local の必須キーが設定されているか確認する（空文字でないこと）
   - ANTHROPIC_API_KEY（必須: 記事自動生成）
   - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY（必須: DB機能）
   - SUPABASE_SERVICE_ROLE_KEY（必須: サーバー側DB操作・記事生成）
   - CRON_SECRET（必須: Cron APIガード）
5. 未設定の場合は既存アプリの .env.local からコピーするか手動設定

## 成果物提出前の必須手順（タスク完了時に必ず実行）
1. quality_gates_v9.md の合格条件を全項目チェック
2. npm run build でエラーがないことを確認
3. ブラウザで動作確認（テストなしのデプロイは不合格）
4. 全項目合格するまで自分で修正してから報告
5. 合格していない場合は自分で差し戻して修正すること
6. サボり禁止：テストなしのデプロイは不合格。必ず自分でブラウザテストして合格基準を満たすこと

---
# HONMONOブログ 指示書

## あなたの役割
あなたはシニアフルスタックエンジニアです。
HONMONOブログをSEOに強い高品質なブログメディアとして実装してください。

## ブランド
HONMONO

## コンセプト
AIが毎日深掘りするニッチな知識の宝庫。
7カテゴリ（世界の食・日本文化・AI・健康・サウナ・珈琲・キャンプ）で
ロングテールSEOを狙い、既存5アプリへの送客ハブとして機能する。

## 技術スタック
- Next.js 14+ App Router + TypeScript + Tailwind CSS
- Supabase（DB: gdifculokwftyxualoxb 既存共有）
- Vercel（デプロイ）
- Claude Haiku（記事自動生成）
- Vercel Cron（1日1回 JST 03:00）

## URL構造
/[lang]/ → トップ
/[lang]/[category]/ → カテゴリ
/[lang]/[category]/[slug]/ → 記事詳細（ISR 1時間）

## カテゴリ（7軸）
- world-food: 世界の食卓探訪
- japan-culture: ニッポン再発見
- ai: AI実践ラボ
- health: カラダの本音
- sauna: ととのい研究所
- coffee: 珈琲深煎り帖
- camp: 野営の流儀

## 既存5アプリ（内部リンク先）
- 添加物図鑑: https://tenkabutsu-zukan.vercel.app
- 栄養図鑑: https://eiyo-zukan.vercel.app
- 蒸され人: https://musarebito.vercel.app
- リタマ: https://ritama.vercel.app
- アリフ: https://arifu.vercel.app

## 禁止事項
- Inter/Roboto/Arialフォントの使用（AIスロップデザイン禁止）
- 医療効果の断定（薬機法配慮）
- 著作物の無断引用
- テストなしのデプロイ
- MVPを超えた機能を作る
- 月コスト500円超過の設計

---

## サブエージェント体制（22名）

このプロジェクトには専門サブエージェント22名が定義されている。
タスクに応じて適切なロールで実行すること。

### 戦略レイヤー
| 起動キーワード | 役割 | 定義ファイル |
|---|---|---|
| "Claude-Sageとして" | 戦略補佐 | agents/01_claude_sage_CLAUDE.md |
| "Ryotaとして" | 戦略オフィサー(CSO) | agents/08_ryota_cso_CLAUDE.md |
| "Yukiとして" | 収益最適化(CRO) | agents/09_yuki_cro_CLAUDE.md |

### 開発レイヤー
| 起動キーワード | 役割 | 定義ファイル |
|---|---|---|
| "Daichiとして" | プロダクトマネージャー | agents/10_daichi_pm_CLAUDE.md |
| "Ayanoとして" | UXディレクター | agents/11_ayano_ux_CLAUDE.md |
| "Kenjiとして" | フロントエンド | agents/12_kenji_frontend_CLAUDE.md |
| "Soraとして" | バックエンド | agents/02_sora_backend_CLAUDE.md |
| "Mayaとして" | DBアーキテクト | agents/13_maya_db_CLAUDE.md |
| "Hiroとして" | DevOps | agents/14_hiro_devops_CLAUDE.md |

### コンテンツレイヤー
| 起動キーワード | 役割 | 定義ファイル |
|---|---|---|
| "Rinとして" | 編集長 | agents/15_rin_editor_CLAUDE.md |
| "Takaとして" | キーワード | agents/16_taka_keyword_CLAUDE.md |
| "Ioriとして" | プロンプト | agents/03_iori_prompt_CLAUDE.md |
| "Naoとして" | ファクトチェック | agents/17_nao_factcheck_CLAUDE.md |
| "Kanaとして" | コピーライター | agents/18_kana_copywriter_CLAUDE.md |

### マーケティングレイヤー
| 起動キーワード | 役割 | 定義ファイル |
|---|---|---|
| "Shinとして" | SEO | agents/19_shin_seo_CLAUDE.md |
| "Mioとして" | X運用 | agents/20_mio_x_CLAUDE.md |
| "Renaとして" | Instagram | agents/21_rena_instagram_CLAUDE.md |
| "Junとして" | グロースハック | agents/22_jun_growth_CLAUDE.md |

### データ・収益レイヤー
| 起動キーワード | 役割 | 定義ファイル |
|---|---|---|
| "Akiとして" | データ分析 | agents/05_aki_analyst_CLAUDE.md |
| "Yuとして" | パートナーシップ | agents/04_yu_partnership_CLAUDE.md |

### リスク管理レイヤー
| 起動キーワード | 役割 | 定義ファイル |
|---|---|---|
| "Hayatoとして" | 法務 | agents/06_hayato_legal_CLAUDE.md |
| "Rikuとして" | セキュリティ | agents/07_riku_security_CLAUDE.md |

ロール指定がない場合は CEO エネルスからの指示として受け取り、Claude-Sage が適切なエージェントへ振り分ける。
各エージェントの定義ファイルを必ず読んでからタスクを実行する。
複数エージェントの連携が必要な場合は、各定義の連携プロトコルに従う。

---

## 必須運用ルール（v2 - 事故防止版）

### Hiro (DevOps) の絶対責務
以下のタイミングで必ず自動で git commit + push する:
1. 新ファイル作成後
2. 既存ファイル修正後（5ファイル以上または重要ファイル：CLAUDE.md / package.json / vercel.json / *.config.* / app配下）
3. スクリプト実行で DB に変更を加えた後
4. 1セッションで30分以上経過した時点

コミットメッセージは Conventional Commits 形式:
- feat: 新機能
- fix: バグ修正
- chore: 雑務（依存追加・設定変更）
- docs: ドキュメント更新
- refactor: リファクタ
- security: セキュリティ修正

### Riku (Security) の必須確認
以下の破壊的操作は実行前に必ずユーザー確認:
1. Remove-Item / rm -rf
2. Move-Item / mv（フォルダごと移動）
3. Rename-Item（プロジェクトルートのリネーム）
4. git push --force / git reset --hard
5. DROP TABLE / DELETE FROM（WHERE句なし）
6. .env / .env.local の削除・上書き

### Daichi (PM) の整合性チェック
以下の変更時は影響範囲を grep で確認してから実行:
1. ファイル/フォルダのリネーム → 全コード内の参照を検索
2. 環境変数名の変更 → .env.local / vercel.json / コード全体を検索
3. API パスの変更 → フロント・cron・外部ドキュメント全部検索
4. テーブル名・カラム名の変更 → src/ scripts/ 全部検索

### 自走モードの起動条件
ユーザーから「全部やって」「自走して」「自動でやって」などの指示があった場合:
1. CEO (Ryota) がタスク分解
2. 担当エージェントに振り分け（前回提示のマッピング表参照）
3. Hiro が作業の前後で git commit/push
4. Riku が破壊的操作を検知したら停止してユーザー確認
5. Daichi が整合性チェック
6. 完了後にサマリーを1回だけ報告（途中質問なし）

### この事故から得た教訓
- ローカルフォルダ名と GitHub/Vercel のリポジトリ名は別物
- フォルダリネームは Vercel/GitHub 側のリネームと組で実施する（片方だけは絶対NG）
- バージョン管理されていないファイル削除は即座に復旧不能
- 「思い込みで進める」のではなく「実態を確認してから進める」

---
## デプロイ絶対ルール（2026/07/06制定）
1. vercel CLI コマンドは一切使用禁止（vercel deploy / vercel alias / vercel link 全部）
2. デプロイは git push origin master のみ
3. push前に git remote -v で origin が t-code0/ 配下であることを必ず確認
4. push後、GitHubコミットが上がっていることをghコマンドで確認
5. Vercelの自動デプロイ結果は本番URL（*.vercel.app）へのcurlで検証、CLIで確認しない

## CHECKエージェント追加項目
- デプロイ検証時、URLホスト部分が想定と一致するか確認
  （プロジェクト名.vercel.app であって別名ではないこと）
- 別アカウント（fusuke-pos等）が絡む出力を検知したら即STOPして人間に報告

## 事故防止
- 別Vercelアカウントに漏れる事故が2026/07/06に発生。同種の再発防止のため上記を厳守。
- .vercel ディレクトリは gitignore 済みであること。存在していたら削除してから作業開始。

## 自走モード
- 経過報告のための停止禁止。タスクリストを最後まで連続実行する
- 確認せず自分で判断して進めてよいもの:
  - ファイル追加・変更・commit・push（gitで巻き戻せるため）
  - 容量100MB未満のリポジトリへの追加
  - 実装方式・ライブラリ選定・命名
  - 軽微なエラーのリトライと迂回
- 人間の確認が必要なのは以下のみ:
  1. 外部サービス上のデータの削除・非公開化（SUZURI / GitHub / Vercel / Supabase）
  2. 課金が発生する操作
  3. スコープ外フォルダへのアクセスが必要になった時
  4. 3回リトライしても解決しないエラー
- 判断基準:「後で取り消せるか」→取り消せるなら実行、取り消せないなら停止して確認
- 完了報告は最後に1回だけ、簡潔に。ただし失敗・未実施・想定と違った点は必ず書く

## gitアカウント保護（強化版）
- remote URLは https://t-code0@github.com/... 形式を維持すること
- ユーザー名なしのURLに戻すことを禁止
- push失敗時に gh auth switch を実行してよい
