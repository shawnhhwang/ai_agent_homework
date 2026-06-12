# AI Agent 實作工作坊（JavaScript 版）

by eddie@5xcampus.com

---

# 作業 2：新增一個 Function Calling 工具

本專案已成功在 `HW2` 分支中實作了一個**單位換算（Unit Conversion）** 工具，支援多維度單位的雙向換算，並整合至 `function_call.js` 的互動式對話助理中。

## 🌟 工具設計與 Schema 規格
- **工具名稱**：`convert_unit`
- **功能描述**：進行溫度（攝氏↔華氏）、長度（公里↔英里）、重量（公斤↔磅）的單位雙向換算。
- **支援的換算邏輯**：
  - 攝氏 ↔ 華氏：$°F = °C \times 9/5 + 32$ / $°C = (°F - 32) \times 5/9$
  - 公里 ↔ 英里：$1\text{ km} = 0.621371\text{ mile}$
  - 公斤 ↔ 磅：$1\text{ kg} = 2.20462\text{ lb}$
- **錯誤處理**：對於不支援的單位組合，會透過工具的實作回傳帶有錯誤描述的 JSON 物件。

### Zod Schema 定義
在 [tools/convert_unit.js](file:///home/coder/Codebase/kaochenlong/tools/convert_unit.js) 中定義規格如下：
```javascript
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
```

---

## 💬 測試對話紀錄（Function Calling 驗證）

以下為執行 `node function_call.js` 的真實互動式測試對話紀錄，驗證 AI 能正確解析使用者的自然語言意圖、呼叫 `convert_unit` 工具並進行單位換算：

### 📌 測試 1：溫度換算
*   **使用者**：`25 度 C 是華氏幾度？`
*   **後台工具呼叫**：`[呼叫 tool] convert_unit({"value":25,"from_unit":"C","to_unit":"F"})`
*   **機器人回答**：
    > 25 度攝氏轉換為華氏是 77 度華氏。

### 📌 測試 2：長度換算
*   **使用者**：`10 公里等於幾英里？`
*   **後台工具呼叫**：`[呼叫 tool] convert_unit({"value":10,"from_unit":"km","to_unit":"mile"})`
*   **機器人回答**：
    > 10 公里等於約 6.21 英里。

### 📌 測試 3：重量換算
*   **使用者**：`70 公斤是幾磅？`
*   **後台工具呼叫**：`[呼叫 tool] convert_unit({"value":70,"from_unit":"kg","to_unit":"lb"})`
*   **機器人回答**：
    > 70 公斤約等於 154.32 磅。

### 📌 測試 4：單位不相容之排除（LLM 常識攔截）
*   **使用者**：`請幫我把 50 公升換算成公尺。`
*   **機器人回答**：
    > 公升（L）是體積單位，而公尺（m）是長度單位，這兩者無法直接進行換算。如果你想要了解某個物體的長度或體積，請提供更多資訊，例如物體的形狀或其他相關數據，我將為你提供幫助！

