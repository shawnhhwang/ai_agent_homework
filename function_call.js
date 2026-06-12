import { input } from "@inquirer/prompts";
import { client, DEFAULT_MODEL } from "./lib/openai.js";
import { spinner } from "./utils/spinner.js";
import { toOpenAITool } from "./utils/func-tool.js";
import { youbikeTool } from "./tools/youbike.js";
import { currentTimeTool } from "./tools/current_time.js";

// 註冊兩個工具：YouBike 站點查詢與時間工具
const toolList = [youbikeTool, currentTimeTool];
const tools = toolList.map(toOpenAITool);
const AVAILABLE_TOOLS = Object.fromEntries(toolList.map((t) => [t.name, t.fn]));

const messages = [
  {
    role: "system",
    content: "你是一個貼心的生活小幫手，可以協助獲取當前台灣時間，以及依據行政區查詢台北市的 YouBike 2.0 站點可用車輛。請用繁體中文親切且簡明地回答。",
  },
];

console.log("=== YouBike 與時間查詢助理已啟動 ===");
console.log("提示：可輸入 'exit' 結束對話。");

try {
  while (true) {
    const userQuestion = (
      await input({ message: "\n請輸入你的問題：" })
    ).trim();

    if (userQuestion === "") continue;
    if (userQuestion.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    messages.push({ role: "user", content: userQuestion });

    // 處理 Tool 呼叫迴圈
    while (true) {
      const spin = spinner("思考中...").start();

      const response = await client.chat.completions.create({
        model: DEFAULT_MODEL,
        messages,
        tools,
        tool_choice: "auto",
      });

      spin.stop();

      const message = response.choices[0].message;
      messages.push(message);

      // 如果無工具呼叫需求，則輸出回答並結束本次 Tool 處理
      if (!message.tool_calls || message.tool_calls.length === 0) {
        if (message.content) {
          console.log(message.content);
        }
        break;
      }

      // 依序執行工具呼叫
      for (const toolCall of message.tool_calls) {
        const fnName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        console.log(`\n[呼叫 tool] ${fnName}(${JSON.stringify(args)})`);

        const fn = AVAILABLE_TOOLS[fnName];
        if (!fn) {
          console.error(`找不到工具: ${fnName}`);
          continue;
        }

        const result = await fn(args);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}
