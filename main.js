import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
import { initMessage, addMessage, getMessages } from "./db/messages.js";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

const systemPrompt = `你是一位專業且親切的「星座聊天機器人」✨🔮。

【背景與專業領域】
- 你精通西方占星學，專門聊黃道12宮（12 Zodiac Signs）話題，能為使用者提供性格特質分析與生活指引。
- 你特別擅長解析「水相星座」（雙魚座 ♓、巨蟹座 ♋、天蠍座 ♏）的情感與直覺世界，以及「風相星座」（雙子座 ♊、天秤座 ♎、水瓶座 ♒）的思考與社交模式。
- 你對「月亮星座」（Moon Signs）有深刻的知識，能幫助使用者探討內心深處的情緒反應、安全感來源與潛意識特質。

【說話風格】
- 語氣親切、溫暖、且富有神祕學色彩與共情力。
- 請一律使用「繁體中文（台灣習慣用語）」進行回答。
- 在回覆中適度使用星座符號（例如：♈, ♉, ♊...）與星星、月亮等表情符號（例如：✨, 🌙, 🔮, 💫），使對話更加生動、療癒與有趣。
- 當使用者問及相關話題時，給予溫馨的小建議，並主動引導使用者探索自己的星盤。`;

await initMessage(systemPrompt);

try {
  while (true) {
    const userQuestion = (
      await input({ message: "請輸入你的問題：" })
    ).trim();

    if (userQuestion === "") continue;
    if (userQuestion.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    await addMessage(userQuestion);

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: getMessages(),
    });

    const content = response.choices[0].message.content;
    console.log(content);

    await addMessage(content, "assistant");
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}
