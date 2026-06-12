import { embed, cosineSimilarity } from "../lib/embeddings.js";

const groups = [
  {
    name: "第一組：意思相近的句子",
    sentences: [
      "我喜歡喝咖啡",
      "咖啡的香氣很迷人",
      "我每天早上都要喝一杯咖啡",
    ],
  },
  {
    name: "第二組：意思不同的句子",
    sentences: [
      "高鐵快要進站了",
      "這部電影很好看",
      "手機快沒電了",
    ],
  },
  {
    name: "第三組：咖啡與茶葉話題的句子",
    sentences: [
      "我喜歡咖啡的味道",
      "我也喜歡茶葉的味道",
      "咖啡和茶是我生活不能缺少的調劑",
    ],
  },
];

async function main() {
  console.log("=== 向量相似度實驗測試程式 ===");
  console.log("正在使用 OpenAI Embeddings API 計算句子的 Cosine Similarity...\n");

  for (const group of groups) {
    console.log(`📊 ${group.name}`);
    console.log("--------------------------------------------------");

    // 取得所有向量
    const vectors = [];
    for (let i = 0; i < group.sentences.length; i++) {
      const text = group.sentences[i];
      console.log(`   [句子 ${i + 1}]: "${text}"`);
      const vec = await embed(text);
      vectors.push(vec);
    }
    console.log("\n   兩兩句子之間的相似度計算結果：");

    // 計算兩兩相似度
    const pairs = [
      { i: 0, j: 1 },
      { i: 0, j: 2 },
      { i: 1, j: 2 },
    ];

    for (const pair of pairs) {
      const sim = cosineSimilarity(vectors[pair.i], vectors[pair.j]);
      console.log(`   👉 [句子 ${pair.i + 1}] vs [句子 ${pair.j + 1}] 的相似度：${sim.toFixed(5)}`);
    }
    console.log("==================================================\n");
  }
}

main().catch((err) => {
  console.error("實驗執行出錯：", err);
  process.exit(1);
});
