import { client } from "./openai.js";

export const EMBEDDING_MODEL = "text-embedding-3-small";

/**
 * 呼叫 OpenAI API 取得文字的向量嵌入
 * @param {string} text - 輸入的文字
 * @returns {Promise<number[]>} - 1536 維的數值陣列
 */
export async function embed(text) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}

/**
 * 計算兩個數值向量之間的 Cosine Similarity
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} - 介於 -1 到 1 之間的分數
 */
export function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
