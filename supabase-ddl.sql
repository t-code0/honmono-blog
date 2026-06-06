-- ============================================================
-- 🔴 手動① Supabase SQL Editor で実行してください
-- HONMONOブログ テーブル定義
-- ============================================================

-- 1. blog_keywords テーブル
CREATE TABLE IF NOT EXISTS blog_keywords (
  id BIGSERIAL PRIMARY KEY,
  keyword TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  search_intent TEXT NOT NULL DEFAULT 'explainer',
  affiliate_links JSONB DEFAULT NULL,
  priority INT NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'published', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 2. blog_articles テーブル
CREATE TABLE IF NOT EXISTS blog_articles (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  keyword_id BIGINT REFERENCES blog_keywords(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_md TEXT NOT NULL,
  toc JSONB DEFAULT '[]'::jsonb,
  affiliate_blocks JSONB DEFAULT NULL,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 3. blog_generation_logs テーブル
CREATE TABLE IF NOT EXISTS blog_generation_logs (
  id BIGSERIAL PRIMARY KEY,
  keyword_id BIGINT REFERENCES blog_keywords(id),
  model TEXT NOT NULL,
  input_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  cost_jpy NUMERIC(10,4) NOT NULL DEFAULT 0,
  duration_ms INT NOT NULL DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. インデックス
CREATE INDEX IF NOT EXISTS idx_blog_articles_category_status ON blog_articles(category, status);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published_at ON blog_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_keywords_status ON blog_keywords(status);
CREATE INDEX IF NOT EXISTS idx_blog_keywords_priority ON blog_keywords(priority);

-- 5. RLS有効化
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_generation_logs ENABLE ROW LEVEL SECURITY;

-- 6. RLSポリシー: anonロールはpublished記事のみSELECT可
CREATE POLICY "anon_read_published_articles" ON blog_articles
  FOR SELECT TO anon
  USING (status = 'published');

-- blog_keywordsはanonからの読み取り不要（APIがservice_roleで操作）
-- blog_generation_logsもanonからの読み取り不要

-- service_role は RLS をバイパスするのでポリシー不要

-- 7. affiliate_programs テーブル
CREATE TABLE IF NOT EXISTS affiliate_programs (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  reward_type TEXT DEFAULT 'purchase',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_programs_category ON affiliate_programs(category);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_active ON affiliate_programs(active);

ALTER TABLE affiliate_programs ENABLE ROW LEVEL SECURITY;

-- 8. blog_affiliate_clicks トラッキングテーブル
CREATE TABLE IF NOT EXISTS blog_affiliate_clicks (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT REFERENCES blog_articles(id),
  program_id BIGINT REFERENCES affiliate_programs(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_affiliate_clicks_article ON blog_affiliate_clicks(article_id);
CREATE INDEX IF NOT EXISTS idx_blog_affiliate_clicks_program ON blog_affiliate_clicks(program_id);
CREATE INDEX IF NOT EXISTS idx_blog_affiliate_clicks_date ON blog_affiliate_clicks(created_at DESC);

ALTER TABLE blog_affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_clicks" ON blog_affiliate_clicks
  FOR INSERT TO anon
  WITH CHECK (true);

-- ============================================================
-- 🔴 手動② 初期キーワード35件投入
-- ============================================================

INSERT INTO blog_keywords (keyword, category, search_intent, priority) VALUES
-- world-food (5件)
('世界のアイスクリーム図鑑 各国の伝統的な氷菓を巡る', 'world-food', 'list', 1),
('イランのバスタニとは 薔薇水とサフランが香る氷菓の世界', 'world-food', 'explainer', 2),
('発酵食品の世界地図 味噌だけじゃない各国の知恵', 'world-food', 'list', 3),
('西アフリカのストリートフード 屋台文化の奥深さ', 'world-food', 'explainer', 4),
('中央アジアの遊牧民料理 馬乳酒から羊肉料理まで', 'world-food', 'explainer', 5),

-- japan-culture (5件)
('青森ねぶた以外の日本の奇祭 知られざる地方の祝祭', 'japan-culture', 'list', 1),
('失われつつある日本の伝統工芸 後継者不足の現実と再生の動き', 'japan-culture', 'explainer', 2),
('日本の廃線跡を歩く 鉄道遺構が語る地方の歴史', 'japan-culture', 'list', 3),
('和紙の産地別特徴 越前・美濃・土佐の技術と違い', 'japan-culture', 'comparison', 4),
('日本の発酵調味料大全 醤油・味噌・酢の地域差', 'japan-culture', 'list', 5),

-- ai (5件)
('Claude Code 使い方ガイド AI駆動開発の実践', 'ai', 'howto', 1),
('Cursor vs Claude Code 比較 AI開発ツールの選び方', 'ai', 'comparison', 2),
('プロンプトエンジニアリング実践テクニック 出力精度を高める方法', 'ai', 'howto', 3),
('ローカルLLM入門 自分のPCでAIを動かす方法と選択肢', 'ai', 'howto', 4),
('AIエージェントとは 自律型AIの仕組みと活用事例', 'ai', 'explainer', 5),

-- health (5件)
('無添加食品ブランド徹底比較 本当に安心できる選択肢', 'health', 'comparison', 1),
('腸活フード図鑑 科学的根拠のある腸内環境改善食品', 'health', 'list', 2),
('食品表示の読み方完全ガイド 知らないと損する裏側', 'health', 'howto', 3),
('超加工食品とは 定義と健康への影響をエビデンスで整理', 'health', 'explainer', 4),
('マグネシウム不足の現代人 見過ごされがちなミネラルの重要性', 'health', 'explainer', 5),

-- sauna (5件)
('フィンランド式サウナと日本式の違い 本場の入り方と歴史', 'sauna', 'comparison', 1),
('サウナの科学 ととのいの正体をホルモンから解説', 'sauna', 'explainer', 2),
('テントサウナ入門 自然の中でととのうための完全ガイド', 'sauna', 'howto', 3),
('サウナハットの選び方 素材別の特徴と効果を比較', 'sauna', 'comparison', 4),
('世界のサウナ文化 ロシアのバーニャからトルコのハマムまで', 'sauna', 'list', 5),

-- coffee (5件)
('シングルオリジンコーヒー産地図鑑 味の違いを生む風土', 'coffee', 'list', 1),
('コーヒーの精製方法による味の違い ナチュラル・ウォッシュド・ハニー', 'coffee', 'comparison', 2),
('自宅焙煎入門 手網からスタートするコーヒー焙煎', 'coffee', 'howto', 3),
('コーヒーと健康 カフェインの効果と適正量をエビデンスで整理', 'coffee', 'explainer', 4),
('世界のコーヒー儀式 エチオピアのセレモニーからベトナム式まで', 'coffee', 'list', 5),

-- camp (5件)
('ブッシュクラフト入門 最小限の道具で自然と向き合う技術', 'camp', 'howto', 1),
('焚き火台徹底比較 ソロからファミリーまで用途別ガイド', 'camp', 'comparison', 2),
('冬キャンプの防寒術 快適に過ごすための装備と知恵', 'camp', 'howto', 3),
('キャンプ飯の科学 アウトドアで美味しく調理するコツ', 'camp', 'howto', 4),
('日本の野営可能な場所ガイド 無料キャンプ場と注意点', 'camp', 'list', 5)
ON CONFLICT (keyword) DO NOTHING;
