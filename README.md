# AI Agent 實作工作坊（JavaScript 版）

by eddie@5xcampus.com

---

# 作業 4：整合 YouBike 與時間工具

本專案已成功在 `HW4` 分支中實作了一個能同時回答「現在時間」與「區域 YouBike 站點可借車量」的智慧生活助理。

## 🌟 工具設計與 Schema 規格
本分支的主程式中，註冊了以下兩個工具：

1.  **時間工具**：`get_current_time`
    *   取得當前台灣的台北時間（Asia/Taipei）。
2.  **區域查詢版 YouBike 工具**：`get_youbike_by_district`
    *   依據台北市行政區名稱（例如大安區、信義區，請勿直接輸入「台北市」）查詢該區可租借與可還的 YouBike 2.0 站點。不需要進行經緯度與距離計算，直接透過 API 進行篩選。

### YouBike 區域查詢工具定義
在 [tools/youbike.js](file:///home/coder/Codebase/kaochenlong/tools/youbike.js) 中實作如下：
```javascript
export const youbikeTool = defineTool({
  name: "get_youbike_by_district",
  description: "依據台北市的行政區名稱（例如：大安區、信義區）查詢該行政區可租借的 YouBike 站點資訊。",
  fn: getYoubikeByDistrict,
  parameters: z.object({
    district: z.string().describe("台北市的行政區名稱，例如 '大安區' 或 '信義區'，請勿傳入 '台北市'。"),
    limit: z.number().default(5).describe("回傳的站點筆數上限，預設為 5"),
  }),
});
```

---

## 💬 測試對話紀錄（多工具協同驗證）

執行 `node function_call.js` 的真實互動測試結果：

### 📌 測試 1：單獨詢問時間
*   **使用者**：`現在幾點？`
*   **後台工具呼叫**：`[呼叫 tool] get_current_time({})`
*   **助理回答**：
    > 現在是 2026 年 6 月 12 日 晚上 8:00:08。

### 📌 測試 2：單獨詢問 YouBike 站點
*   **使用者**：`信義區有 YouBike 可以借嗎？`
*   **後台工具呼叫**：`[呼叫 tool] get_youbike_by_district({"district":"信義區","limit":5})`
*   **助理回答**：
    > 信義區有多個 YouBike 站點可以借，以下是部分站點資訊：
    > 
    > 1. **黎忠區民活動中心**
    >    - 地址：和平東路三段391巷16號
    >    - 可用車輛：11 輛
    >    - 可用停車位：7 個
    > 
    > 2. **基隆路二段159巷口**
    >    - 地址：基隆路二段155號
    >    - 可用車輛：6 輛
    >    - 可用停車位：8 個
    > 
    > （以下省略部分站點...）

### 📌 測試 3：同時詢問時間與 YouBike 站點（整合回答驗證）
*   **使用者**：`現在幾點？大安區還有 YouBike 可以借嗎？`
*   **後台工具呼叫**：
    1.  `[呼叫 tool] get_current_time({})`
    2.  `[呼叫 tool] get_youbike_by_district({"district":"大安區","limit":5})`
*   **助理回答**：
    > 現在是 2026 年 6 月 12 日 下午 8:00:47。大安區也有多個 YouBike 站點可以借，以下是部分站點資訊：
    > 
    > 1. **捷運科技大樓站**
    >    - 地址：復興南路二段235號前
    >    - 可用車輛：15 輛
    >    - 可用停車位：13 個
    > 
    > 2. **復興南路二段273號前**
    >    - 地址：復興南路二段273號西側
    >    - 可用車輛：14 輛
    >    - 可用停車位：6 個
    > 
    > （以下省略部分站點...）

