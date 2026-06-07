-- ============================================================
-- RLS 状態確認クエリ（Supabase SQL Editor で実行）
-- ============================================================

-- 1. 全 blog_ テーブルの RLS 有効/無効状態
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND (tablename LIKE 'blog_%' OR tablename = 'affiliate_programs')
ORDER BY tablename;

-- 2. 各テーブルのポリシー一覧
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (tablename LIKE 'blog_%' OR tablename = 'affiliate_programs')
ORDER BY tablename, policyname;
