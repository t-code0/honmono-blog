/**
 * A8.net approved programs bulk fetcher
 *
 * 1. Login to https://media-console.a8.net
 * 2. Open DevTools > Console (F12)
 * 3. Paste this entire script and press Enter
 * 4. After completion, run: copy(JSON.stringify(window.__a8_results, null, 2))
 * 5. Save as scripts/a8_results.json
 */
(async function a8Fetch() {
  console.log("[START] A8.net program fetch...");

  var allPrograms = [];
  var pageNo = 1;
  var pageSize = 100;
  var hasMore = true;

  while (hasMore) {
    var apiUrl = "/api/v1/user/program/management/approved?pageNo=" + pageNo + "&pageSize=" + pageSize + "&sortKey=APPROVED_DATE&sortOrder=DESC";
    console.log("[PAGE " + pageNo + "] fetching...");

    var res = await fetch(apiUrl);
    if (!res.ok) {
      console.error("[ERROR] Page " + pageNo + " failed: " + res.status);
      hasMore = false;
      continue;
    }

    var data = await res.json();
    var programs = data.approved_program_detail_list || [];

    if (programs.length === 0) {
      hasMore = false;
      continue;
    }

    allPrograms = allPrograms.concat(programs);
    console.log("  -> " + programs.length + " items (total: " + allPrograms.length + ")");

    if (programs.length < pageSize) {
      hasMore = false;
      continue;
    }

    pageNo++;
    await new Promise(function(r) { setTimeout(r, 1000); });
  }

  console.log("\n[INFO] Total approved programs: " + allPrograms.length);
  console.log("[INFO] Fetching affiliate links...\n");

  var results = [];
  var success = 0;
  var failed = 0;

  for (var i = 0; i < allPrograms.length; i++) {
    var p = allPrograms[i];
    var pid = p.program_id;
    var linkUrl = "/program/create-link?programId=" + pid + "&websiteId=002&materialType=ALL&bannerSize=00&pageSize=SIZE_20&sortType=EPC_DESC";

    try {
      var linkRes = await fetch(linkUrl);
      var html = await linkRes.text();
      var match = html.match(/https:\/\/px\.a8\.net\/svt\/ejp\?a8mat=[A-Za-z0-9+]+/);

      if (match) {
        var epcVal = (p.last30_days_epc && p.last30_days_epc.epc) ? p.last30_days_epc.epc : 0;
        results.push({
          a8_program_id: pid,
          name: p.program_name || "",
          reward: p.achievement_reward || "",
          epc: epcVal,
          url: match[0],
          approved_date: p.approved_date || ""
        });
        success++;
        var pname = (p.program_name || "").substring(0, 40);
        console.log("[OK " + (i + 1) + "/" + allPrograms.length + "] " + pname + " (EPC: " + epcVal + ")");
      } else {
        failed++;
        console.warn("[SKIP " + (i + 1) + "/" + allPrograms.length + "] " + (p.program_name || "").substring(0, 40) + " - no link found");
      }
    } catch (e) {
      failed++;
      console.error("[ERR " + (i + 1) + "/" + allPrograms.length + "] " + pid + " " + e.message);
    }

    await new Promise(function(r) { setTimeout(r, 1000); });
  }

  window.__a8_results = results;

  console.log("\n========================================");
  console.log("[DONE] Fetch complete!");
  console.log("  Success: " + success);
  console.log("  Failed:  " + failed);
  console.log("  Total:   " + allPrograms.length);
  console.log("\nTo copy results run:");
  console.log("  copy(JSON.stringify(window.__a8_results, null, 2))");
  console.log("========================================");
})();
