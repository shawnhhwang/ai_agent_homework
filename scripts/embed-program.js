import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { client } from "../lib/openai.js";
import {
  qdrant,
  PROGRAM_COLLECTION,
  EMBEDDING_DIM,
  EMBEDDING_MODEL,
} from "../lib/qdrant.js";

const CSV_PATH = "data/program.csv";

function rowToText(row) {
  return `${row.name} | ${row.category} | ${row.description}`;
}

async function recreateCollection() {
  const exists = await qdrant.collectionExists(PROGRAM_COLLECTION);
  if (exists.exists) {
    await qdrant.deleteCollection(PROGRAM_COLLECTION);
  }
  await qdrant.createCollection(PROGRAM_COLLECTION, {
    vectors: { size: EMBEDDING_DIM, distance: "Cosine" },
  });
}

async function embedText(text) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}

async function main() {
  const csv = await readFile(CSV_PATH, "utf8");
  const rows = parse(csv, { columns: true, skip_empty_lines: true });
  console.log(`讀到 ${rows.length} 筆開發工具資料`);

  await recreateCollection();
  console.log(`已建立/重置 collection: ${PROGRAM_COLLECTION}`);

  const points = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const text = rowToText(row);
    console.log(`正在處理第 ${i + 1} 筆：${row.name}`);
    const vector = await embedText(text);

    points.push({
      id: i + 1,
      vector,
      payload: {
        name: row.name,
        category: row.category,
        description: row.description,
      },
    });
  }

  await qdrant.upsert(PROGRAM_COLLECTION, { wait: true, points });
  console.log("資料庫寫入完成！");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
