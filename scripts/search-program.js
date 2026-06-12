import { searchProgram } from "../lib/qdrant.js";

const testQueries = [
  "如何做版本控制與追蹤代碼變更歷史？",
  "幫我推薦一個適合打包應用程式跟其依賴項的輕量容器引擎",
  "有沒有好用的 AI 程式碼編輯器可以用？",
];

async function main() {
  console.log("=== 向量資料庫搜尋測試程式 ===");
  console.log("正在使用 Cosine Similarity 進行語意搜尋...\n");

  for (const query of testQueries) {
    console.log(`🔍 搜尋問法："${query}"`);
    console.log("-----------------------------------------");

    const results = await searchProgram(query, 3);
    for (const [i, r] of results.entries()) {
      console.log(`${i + 1}. 【${r.name}】(${r.category})`);
      console.log(`   Cosine 相似度分數：${r.score.toFixed(4)}`);
      console.log(`   描述：${r.description}`);
      console.log();
    }
    console.log("=========================================\n");
  }
}

main().catch((err) => {
  console.error("搜尋錯誤：", err);
  process.exit(1);
});
