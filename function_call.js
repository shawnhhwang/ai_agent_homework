import { input } from "@inquirer/prompts";
import { client, DEFAULT_MODEL } from "./lib/openai.js";
import { spinner } from "./utils/spinner.js";
import { toOpenAITool } from "./utils/func-tool.js";
import * as allTools from "./tools/index.js";

const toolList = Object.values(allTools);
const tools = toolList.map(toOpenAITool);
const AVAILABLE_TOOLS = Object.fromEntries(toolList.map((t) => [t.name, t.fn]));

const messages = [
  {
    role: "system",
    content: "你是一個貼心的生活小幫手，可以協助查詢天氣、獲取當前時間、查詢 YouBike 站點，以及進行溫度（攝氏↔華氏）、長度（公里↔英里）、重量（公斤↔磅）的單位換算。請用繁體中文親切地回答。",
  },
];

console.log("=== 生活小幫手（含單位換算與天氣助理）已啟動 ===");
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

    // 處理 Function Calling 的迴圈
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

      // 如果不需要呼叫工具，則印出回答並跳出 Tool 處理迴圈
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
