# もしもアフィリエイト プログラム取得手順

## 概要

もしもアフィリエイトで提携中のプログラム一覧を取得し、
Supabase の `affiliate_programs` テーブルに投入するための手順。

## 手順

### Step 1: プログラム一覧を取得

1. Chrome で https://af.moshimo.com にログイン
2. 提携中プロモーション一覧へ移動:
   `https://af.moshimo.com/af/shop/promotion/search?status=approved`
3. DevTools を開く (F12 → Console タブ)
4. `scripts/moshimo_fetch_programs.js` の内容を全選択してコピー
5. Console に貼り付けて Enter
6. 取得完了まで待機（プログラム数に応じて数分）
7. 完了メッセージが出たら以下を実行:

```js
copy(JSON.stringify(window.__moshimo_results, null, 2))
```

8. プロジェクトルートに `scripts/moshimo_results.json` として保存

### Step 2: Supabase に投入

```bash
node scripts/a8_import_to_supabase.mjs scripts/moshimo_results.json
```

> 注: a8_import_to_supabase.mjs は URL の重複チェック機能があるため、
> 既に登録済みのプログラムはスキップされます。
> source カラムは JSON 内の `source: "moshimo"` が使用されます。

### Step 3: 確認

```bash
node -e "
import { config } from 'dotenv';
config({ path: '.env.local' });
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const res = await fetch(URL + '/rest/v1/affiliate_programs?source=eq.moshimo&select=name,category,active', {
  headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
});
const data = await res.json();
console.log('moshimo programs:', data.length);
data.forEach(p => console.log('  -', p.name, '|', p.category));
"
```

## 注意事項

- もしもの管理画面HTMLは変更される可能性があるため、取得に失敗する場合は
  DevTools の Elements パネルで実際のHTML構造を確認してスクリプトを調整
- レート制限対策として各リクエスト間に 1〜1.5 秒のディレイあり
- `category` はデフォルトで "all" が設定される。
  必要に応じて a8_import_to_supabase.mjs のカテゴリ分類ロジックで振り分け可能

## ファイル構成

```
scripts/
├── moshimo_fetch_programs.js  # ブラウザ用取得スクリプト
├── moshimo_results.json       # 取得結果（Step 1 で生成）
├── a8_import_to_supabase.mjs  # Supabase 投入（共用）
└── moshimo_README.md          # この手順書
```
