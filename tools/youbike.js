import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";

const YOUBIKE_API =
  "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";

/**
 * 依據行政區名稱查詢 YouBike 2.0 站點
 * @param {object} args
 * @param {string} args.district - 行政區名稱，如 "大安區", "信義區"
 * @param {number} args.limit - 回傳站點筆數上限，預設為 5
 */
async function getYoubikeByDistrict({ district, limit = 5 }) {
  const res = await fetch(YOUBIKE_API);
  if (!res.ok) {
    return { error: `無法取得 YouBike 站點資料: ${res.status}` };
  }
  const data = await res.json();

  // 1. 正規化行政區名稱，移除空白並確保結尾有「區」
  let searchArea = district.trim();
  if (searchArea && !searchArea.endsWith("區")) {
    searchArea += "區";
  }

  // 2. 篩選啟用的站點且行政區符合
  const results = data
    .filter((s) => s.act === "1" && s.sarea === searchArea)
    .map((s) => ({
      name: s.sna.replace(/^YouBike2\.0_/, ""),
      district: s.sarea,
      address: s.ar,
      available_bikes: Number(s.available_rent_bikes), // 可借車輛
      available_spaces: Number(s.available_return_bikes), // 可還空位
    }))
    .slice(0, limit);

  if (results.length === 0) {
    return {
      message: `在 「${district}」 找不到任何處於啟用狀態的 YouBike 2.0 站點。請確認是否輸入正確的台北市行政區名稱（如大安區、信義區）。`,
    };
  }

  return results;
}

export const youbikeTool = defineTool({
  name: "get_youbike_by_district",
  description: "依據台北市的行政區名稱（例如：大安區、信義區）查詢該行政區可租借的 YouBike 站點資訊。",
  fn: getYoubikeByDistrict,
  parameters: z.object({
    district: z.string().describe("台北市的行政區名稱，例如 '大安區' 或 '信義區'，請勿傳入 '台北市'。"),
    limit: z.number().default(5).describe("回傳的站點筆數上限，預設為 5"),
  }),
});
