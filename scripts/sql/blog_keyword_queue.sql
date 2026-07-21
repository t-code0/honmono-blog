-- ============================================================
-- 🔴 手動実行: Supabase SQL Editor で実行してください
-- 記事キーワードキュー（Claude Codeサブスク枠パイプライン用）
-- 生成日: 2026-07-22
-- ============================================================
--
-- 【重要】新しいキュー用テーブルは作りません。
--   既存の blog_keywords が既にキューとして機能しているため、
--   そのまま流用します（重複テーブルを避けるため）。
--
--   要求されたカラム        既存 blog_keywords の対応カラム
--   ---------------------  --------------------------------
--   keyword                keyword       (TEXT UNIQUE NOT NULL)
--   status                 status        (pending/generating/published/failed)
--   priority               priority      (INT, 昇順で先に消費される)
--   created_at             created_at    (TIMESTAMPTZ)
--   used_at                published_at  (TIMESTAMPTZ)
--
-- ============================================================
-- セクション1: 任意のDDL（実行しなくても動きます）
-- ============================================================
--
-- 現在の status CHECK 制約は pending / generating / published / failed のみ。
-- 記事は「下書き(draft)」として作られるため、消費済みキーワードを
-- 'published' と記録するのは意味的にややズレます。
-- 'used' を追加するとログが読みやすくなります。
--
-- generate_article.mjs は 'used' を試し、制約で弾かれた場合は自動的に
-- 'published' にフォールバックします。つまりこのDDLは任意です。

-- ALTER TABLE blog_keywords DROP CONSTRAINT IF EXISTS blog_keywords_status_check;
-- ALTER TABLE blog_keywords ADD CONSTRAINT blog_keywords_status_check
--   CHECK (status IN ('pending', 'generating', 'published', 'used', 'failed'));

-- ============================================================
-- セクション2: 初期キーワード30件（DML・実行済み）
-- ============================================================
--
-- 選定方針:
--   - 既存161キーワード / 148記事と重複しないことを確認済み
--   - 既存記事は「仕組み・科学の解説型」に偏っているため、
--     本30件は意図的に「モノ選び・比較」型に寄せてある
--     （アフィリエイト商材と接続しやすいのは後者のため）
--   - HONMONOの軸（食・健康・暮らしの「本物」）に沿う具体的テーマ
--   - 抽象的な大テーマは避け、検索意図が明確なものに限定
--
-- priority は既存pending(13件)を先に消化させるため 20 番台以降を採番。
--
-- 冪等性のため ON CONFLICT (keyword) DO NOTHING を付与。
-- 再実行しても重複しません。

INSERT INTO blog_keywords (keyword, category, search_intent, priority, status) VALUES
-- coffee (5)
('コーヒー用電気ケトルの注湯コントロール比較 温度設定と注ぎ口形状の実用差', 'coffee', 'comparison', 20, 'pending'),
('手挽きコーヒーミルの刃形状比較 コニカル刃とフラット刃の粒度分布', 'coffee', 'comparison', 21, 'pending'),
('ペーパーフィルターの材質別味比較 漂白・無漂白・特殊形状の抽出差', 'coffee', 'comparison', 22, 'pending'),
('コーヒースケールの選び方 0.1g精度とタイマー表示が抽出再現性に与える影響', 'coffee', 'howto', 23, 'pending'),
('保温タンブラーの保温性能実測 コーヒーの風味を落とさない容器選び', 'coffee', 'comparison', 24, 'pending'),

-- camp (4)
('キャンプマットのR値比較 冬季の地面からの熱損失を防ぐ断熱基準', 'camp', 'comparison', 25, 'pending'),
('タープの生地選びと張り方 ポリコットンとナイロンの遮光性と耐火性', 'camp', 'comparison', 26, 'pending'),
('アウトドアチェアの選び方 ローチェアとハイチェアの疲労度と設営性', 'camp', 'comparison', 27, 'pending'),
('焚き火用難燃ウェアの素材比較 火の粉に強い生地と洗濯耐久性', 'camp', 'comparison', 28, 'pending'),

-- health (5)
('プロテインパウダーの種類別選び方 ホエイ・カゼイン・ソイの吸収速度と用途', 'health', 'comparison', 29, 'pending'),
('体組成計の測定精度比較 家庭用と業務用の体脂肪率推定方式の違い', 'health', 'comparison', 30, 'pending'),
('睡眠トラッカーの計測方式比較 加速度センサーと心拍変動の精度差', 'health', 'comparison', 31, 'pending'),
('家庭用浄水器の除去性能比較 活性炭・中空糸膜・RO膜の除去対象物質', 'health', 'comparison', 32, 'pending'),
('サプリメントの品質見極め方 第三者認証と原材料表示から読む信頼性', 'health', 'howto', 33, 'pending'),

-- sauna (4)
('サウナポンチョとバスローブの素材比較 吸水速度と乾燥性の実用評価', 'sauna', 'comparison', 34, 'pending'),
('サウナ用水分補給ボトルの選び方 電解質補給と保冷性能の両立', 'sauna', 'howto', 35, 'pending'),
('サウナ施設の選び方 温度・湿度・水風呂水温から読む設備スペック', 'sauna', 'howto', 36, 'pending'),
('サウナストーンの石種比較 蓄熱性と耐久性による選定基準', 'sauna', 'comparison', 37, 'pending'),

-- japan-culture (4)
('日本の包丁の鋼材別選び方 白紙・青紙・ステンレスの切れ味と手入れ', 'japan-culture', 'comparison', 38, 'pending'),
('南部鉄器の鉄瓶の選び方 鋳肌と内部処理による湯の味と手入れの違い', 'japan-culture', 'howto', 39, 'pending'),
('土鍋の産地別特徴 伊賀・萬古・信楽の蓄熱性と炊飯適性', 'japan-culture', 'comparison', 40, 'pending'),
('漆器の普段使い実践 手入れの手順と経年変化の楽しみ方', 'japan-culture', 'howto', 41, 'pending'),

-- world-food (4)
('エキストラバージンオリーブオイルの見分け方 酸度表示と製造年月の読み方', 'world-food', 'howto', 42, 'pending'),
('世界の塩の使い分け 岩塩・海塩・湖塩の結晶構造と料理適性', 'world-food', 'comparison', 43, 'pending'),
('スパイスの保存と劣化 ホールとパウダーの香気成分の減衰速度比較', 'world-food', 'explainer', 44, 'pending'),
('熟成チーズの家庭での保存方法 湿度と温度管理の実践手順', 'world-food', 'howto', 45, 'pending'),

-- ai (4)
('ローカルLLM用GPUのVRAM要件 モデルサイズ別の必要スペックと選定', 'ai', 'howto', 46, 'pending'),
('開発作業向けキーボードの選び方 打鍵数の多い作業での疲労軽減', 'ai', 'comparison', 47, 'pending'),
('日本語音声入力ツールの精度比較 専門用語認識と句読点自動挿入', 'ai', 'comparison', 48, 'pending'),
('開発用モニターの解像度と文字可読性 コード編集における目の疲労軽減', 'ai', 'comparison', 49, 'pending')
ON CONFLICT (keyword) DO NOTHING;


-- ============================================================
-- セクション3: 運用用スニペット（承認フロー・タスクC）
-- ============================================================

-- 下書き一覧を確認する
-- SELECT id, slug, category, title, LENGTH(content_md) AS chars, created_at
-- FROM blog_articles WHERE status = 'draft' ORDER BY created_at DESC;

-- 本文を読む（1件）
-- SELECT content_md FROM blog_articles WHERE id = <ID>;

-- 下書きを公開する
-- UPDATE blog_articles
-- SET status = 'published', published_at = NOW(), updated_at = NOW()
-- WHERE id = <ID>;

-- 下書きを破棄する（キーワードはキューに戻す）
-- UPDATE blog_articles SET status = 'archived' WHERE id = <ID>;
-- UPDATE blog_keywords SET status = 'pending', published_at = NULL
-- WHERE id = (SELECT keyword_id FROM blog_articles WHERE id = <ID>);
