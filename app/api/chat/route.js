import fs from "fs";
import path from "path";

const projectLinks = {
  fetch: "https://yilinchen.design/fetch",
  oshkosh: "https://yilinchen.design/oshkosh",
  mapwa: "https://yilinchen.design/mapwa",
  lyntra: "https://yilinchen.design/lyntra",
  webredesign: "https://yilinchen.design/webredesign",
  vrgame: "https://yilinchen.design/vr-game"
};

export async function POST(req) {
  try {
    const { message } = await req.json();

    console.log("KEY:", process.env.OPENAI_API_KEY);

    const folderPath = path.join(process.cwd(), "data");
    const files = fs.readdirSync(folderPath);

    let context = "";
    let matchedProjects = [];

    const lowerMsg = message.toLowerCase();

    // 🧠 RAG 检索
    files.forEach(file => {
      const content = fs.readFileSync(path.join(folderPath, file), "utf-8");

      if (lowerMsg.includes("fetch") && file.includes("fetch")) {
        context += content + "\n";
        matchedProjects.push("fetch");
      }

      if (lowerMsg.includes("dashboard") || lowerMsg.includes("truck")) {
        if (file.includes("oshkosh")) {
          context += content + "\n";
          matchedProjects.push("oshkosh");
        }
      }

      if (lowerMsg.includes("student") || lowerMsg.includes("system")) {
        if (file.includes("mapwa")) {
          context += content + "\n";
          matchedProjects.push("mapwa");
        }
      }

      if (lowerMsg.includes("ai") || lowerMsg.includes("study")) {
        if (file.includes("lyntra")) {
          context += content + "\n";
          matchedProjects.push("lyntra");
        }
      }

      if (lowerMsg.includes("website") || lowerMsg.includes("redesign")) {
        if (file.includes("webredesign")) {
          context += content + "\n";
          matchedProjects.push("webredesign");
        }
      }

      if (
        lowerMsg.includes("vr") ||
        lowerMsg.includes("game") ||
        lowerMsg.includes("immersive")
      ) {
        if (file.includes("vrgame")) {
          context += content + "\n";
          matchedProjects.push("vrgame");
        }
      }
    });

    // 👉 fallback（没有匹配）
    if (!context) {
      files.forEach(file => {
        const content = fs.readFileSync(path.join(folderPath, file), "utf-8");
        context += content + "\n";
      });
    }

    // 🤖 调 OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are Yilin Chen, a UX/Product designer.

Use the following context to answer:

${context}

Rules:
- Answer in first person ("I")
- Be concise and clear
- Only use the provided context
- If not relevant, say "I don't have experience with that"
`
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("OPENAI RESPONSE:", data);

    let reply =
      data?.choices?.[0]?.message?.content || "⚠️ AI没有返回内容";

    // 🔗 加 Learn more
    if (matchedProjects.length > 0) {
      const uniqueProjects = [...new Set(matchedProjects)];

      const links = uniqueProjects
        .map(p => `\n🔗 <a href=" ${projectLinks[p]}" target="_blank">Learn more</a>`)
        .join("");

      reply += "\n" + links;
    }

    return Response.json({ reply });

  } catch (error) {
    console.error(error);
    return Response.json({ reply: "Error occurred" }, { status: 500 });
  }
}