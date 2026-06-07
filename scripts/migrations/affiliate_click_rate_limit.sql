-- ============================================================
-- 🔴 手動実行: Supabase SQL Editor で実行してください
-- アフィリエイトクリック レート制限用カラム追加
-- ============================================================

-- 1. ip_hash カラム追加（SHA256ハッシュ、生IPは保存しない）
ALTER TABLE blog_affiliate_clicks
  ADD COLUMN IF NOT EXISTS ip_hash TEXT;

-- 2. user_agent カラム追加
ALTER TABLE blog_affiliate_clicks
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 3. レート制限クエリ用インデックス
CREATE INDEX IF NOT EXISTS idx_blog_affiliate_clicks_ip_hash_time
  ON blog_affiliate_clicks(ip_hash, created_at DESC);

-- 4. 確認
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'blog_affiliate_clicks'
ORDER BY ordinal_position;
