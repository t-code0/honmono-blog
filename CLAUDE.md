## 作業開始前の必須手順（新規タスク開始時のみ）
1. CLAUDE.md を読む（このファイル）
2. プロジェクトファイルの CLAUDE_CEO_v7.md を読む
3. プロジェクトファイルの quality_gates_v7.md を読む
4. .env.local の必須キーが設定されているか確認する（空文字でないこと）
   - ANTHROPIC_API_KEY（必須: 記事自動生成）
   - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY（必須: DB機能）
   - SUPABASE_SERVICE_ROLE_KEY（必須: サーバー側DB操作・記事生成）
   - CRON_SECRET（必須: Cron APIガード）
5. 未設定の場合は既存アプリの .env.local からコピーするか手動設定

## 成果物提出前の必須手順（タスク完了時に必ず実行）
1. quality_gates_v7.md の合格条件を全項目チェック
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
