import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";

function normalizeUnit(unit) {
  if (!unit) return "";
  const u = unit.trim().toLowerCase();
  if (u === "c" || u === "°c" || u === "celsius" || u === "攝氏" || u === "度c" || u === "度 c") return "C";
  if (u === "f" || u === "°f" || u === "fahrenheit" || u === "華氏" || u === "度f" || u === "度 f") return "F";
  if (u === "km" || u === "kilometer" || u === "kilometers" || u === "公里") return "km";
  if (u === "mile" || u === "miles" || u === "英里" || u === "英哩") return "mile";
  if (u === "kg" || u === "kilogram" || u === "kilograms" || u === "公斤") return "kg";
  if (u === "lb" || u === "lbs" || u === "pound" || u === "pounds" || u === "磅") return "lb";
  return u;
}

export async function convertUnit({ value, from_unit, to_unit }) {
  const from = normalizeUnit(from_unit);
  const to = normalizeUnit(to_unit);
  const val = Number(value);

  if (isNaN(val)) {
    return { error: "輸入的換算數值必須是有效的數字。" };
  }

  // 1. 攝氏 ↔ 華氏
  if (from === "C" && to === "F") {
    return {
      value: val,
      from_unit,
      to_unit,
      result: val * 9 / 5 + 32,
    };
  }
  if (from === "F" && to === "C") {
    return {
      value: val,
      from_unit,
      to_unit,
      result: (val - 32) * 5 / 9,
    };
  }

  // 2. 公里 ↔ 英里
  if (from === "km" && to === "mile") {
    return {
      value: val,
      from_unit,
      to_unit,
      result: val * 0.621371,
    };
  }
  if (from === "mile" && to === "km") {
    return {
      value: val,
      from_unit,
      to_unit,
      result: val / 0.621371,
    };
  }

  // 3. 公斤 ↔ 磅
  if (from === "kg" && to === "lb") {
    return {
      value: val,
      from_unit,
      to_unit,
      result: val * 2.20462,
    };
  }
  if (from === "lb" && to === "kg") {
    return {
      value: val,
      from_unit,
      to_unit,
      result: val / 2.20462,
    };
  }

  // 4. 不支援的單位組合，回傳錯誤訊息物件
  return {
    error: `不支援從 「${from_unit}」 換算至 「${to_unit}」。目前僅支援 攝氏↔華氏、公里↔英里、公斤↔磅 的雙向換算。`,
  };
}

export const convertUnitTool = defineTool({
  name: "convert_unit",
  description: "進行溫度（攝氏/華氏）、長度（公里/英里）、重量（公斤/磅）的單位換算。",
  fn: convertUnit,
  parameters: z.object({
    value: z.number().describe("需要換算的數值，例如 25"),
    from_unit: z.string().describe("原始單位，例如 'C', '攝氏', 'km', '公里', 'kg', '公斤'"),
    to_unit: z.string().describe("目標單位，例如 'F', '華氏', 'mile', '英里', 'lb', '磅'"),
  }),
});
