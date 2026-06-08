/**
 * もしもアフィリエイト 提携中プログラム一括取得スクリプト
 *
 * 1. https://af.moshimo.com にログイン
 * 2. 提携中プロモーション一覧ページに移動:
 *    https://af.moshimo.com/af/shop/promotion/search?status=approved
 * 3. DevTools > Console (F12) を開く
 * 4. このスクリプト全体を貼り付けて Enter
 * 5. 完了後: copy(JSON.stringify(window.__moshimo_results, null, 2))
 * 6. scripts/moshimo_results.json として保存
 */
(async function moshimoFetch() {
  console.log("[START] もしもアフィリエイト プログラム取得...");

  var allPrograms = [];
  var page = 1;
  var hasMore = true;

  while (hasMore) {
    var url = "/af/shop/promotion/search?status=approved&page=" + page;
    console.log("[PAGE " + page + "] fetching...");

    try {
      var res = await fetch(url);
      var html = await res.text();
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, "text/html");

      // プロモーションカードを取得
      var cards = doc.querySelectorAll(".promotion-list-item, .promotion-card, tr[data-promotion-id], .c-media");

      // テーブル形式の場合
      if (cards.length === 0) {
        cards = doc.querySelectorAll("table tbody tr");
      }

      // さらにフォールバック: リンク要素からプロモーション情報を抽出
      if (cards.length === 0) {
        var links = doc.querySelectorAll('a[href*="/af/shop/promotion/detail/"]');
        cards = links;
      }

      if (cards.length === 0) {
        console.log("[INFO] Page " + page + " にプログラムなし。取得完了。");
        hasMore = false;
        continue;
      }

      var pagePrograms = [];

      cards.forEach(function(card) {
        try {
          var program = {};

          // プロモーションIDを取得
          var detailLink = card.querySelector ? card.querySelector('a[href*="promotion/detail"]') : card;
          if (detailLink) {
            var href = detailLink.getAttribute("href") || "";
            var idMatch = href.match(/detail\/(\d+)/);
            if (idMatch) program.moshimo_id = idMatch[1];
            program.name = (detailLink.textContent || "").trim().substring(0, 200);
          }

          // 報酬情報
          var rewardEl = card.querySelector ? card.querySelector(".reward, .commission, td:nth-child(3)") : null;
          if (rewardEl) {
            program.reward = rewardEl.textContent.trim().substring(0, 100);
          }

          if (program.name && program.name.length > 0) {
            program.source = "moshimo";
            pagePrograms.push(program);
          }
        } catch (e) {
          // skip invalid card
        }
      });

      if (pagePrograms.length === 0) {
        hasMore = false;
      } else {
        allPrograms = allPrograms.concat(pagePrograms);
        console.log("  -> " + pagePrograms.length + " items (total: " + allPrograms.length + ")");
        page++;
      }

      // ページネーション: 次ページリンクがあるか確認
      var nextLink = doc.querySelector('a[href*="page=' + (page) + '"], .pagination .next a, a[rel="next"]');
      if (!nextLink) {
        hasMore = false;
      }
    } catch (e) {
      console.error("[ERROR] Page " + page + ": " + e.message);
      hasMore = false;
    }

    // レート制限対策
    await new Promise(function(r) { setTimeout(r, 1500); });
  }

  console.log("\n[INFO] Total programs: " + allPrograms.length);
  console.log("[INFO] アフィリエイトリンク取得中...\n");

  // 各プログラムのアフィリエイトリンクを取得
  var results = [];
  var success = 0;
  var failed = 0;

  for (var i = 0; i < allPrograms.length; i++) {
    var p = allPrograms[i];

    if (!p.moshimo_id) {
      failed++;
      continue;
    }

    try {
      // リンク作成ページからアフィリエイトURLを取得
      var linkPageUrl = "/af/shop/promotion/detail/" + p.moshimo_id;
      var linkRes = await fetch(linkPageUrl);
      var linkHtml = await linkRes.text();

      // アフィリエイトリンクのパターン
      var linkMatch = linkHtml.match(/https:\/\/af\.moshimo\.com\/af\/c\/click\?[^"'\s<]+/);

      results.push({
        moshimo_id: p.moshimo_id,
        name: p.name,
        url: linkMatch ? linkMatch[0].replace(/&amp;/g, "&") : "",
        reward: p.reward || "",
        category: "all", // 後でカテゴリ分類スクリプトで振り分け
        source: "moshimo",
      });

      success++;
      console.log("[OK " + (i + 1) + "/" + allPrograms.length + "] " + p.name.substring(0, 40));
    } catch (e) {
      failed++;
      console.error("[ERR " + (i + 1) + "/" + allPrograms.length + "] " + p.moshimo_id + " " + e.message);
    }

    await new Promise(function(r) { setTimeout(r, 1000); });
  }

  window.__moshimo_results = results;

  console.log("\n========================================");
  console.log("[DONE] もしもアフィリエイト取得完了!");
  console.log("  Success: " + success);
  console.log("  Failed:  " + failed);
  console.log("  Total:   " + allPrograms.length);
  console.log("\nTo copy results run:");
  console.log('  copy(JSON.stringify(window.__moshimo_results, null, 2))');
  console.log("\nThen save as: scripts/moshimo_results.json");
  console.log("========================================");
})();
