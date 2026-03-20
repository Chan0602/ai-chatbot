import fs from "fs";
import path from "path";
export const runtime = "nodejs";

const projectLinks = {
  fetch: "https://yilinchen.design/fetch",
  oshkosh: "https://yilinchen.design/oshkosh",
  mapwa: "https://yilinchen.design/mapwa",
  lyntra: "https://yilinchen.design/lyntra",
  webredesign: "https://yilinchen.design/webredesign",
  vrgame: "https://yilinchen.design/vr-game",
  photography: "https://large-topic-971566.framer.app/"
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

      if (lowerMsg.includes("yourself") || lowerMsg.includes("about you") || lowerMsg.includes("who are you") || lowerMsg.includes("background") || lowerMsg.includes("interest") || lowerMsg.includes("hobby") || lowerMsg.includes("guzheng") || lowerMsg.includes("baking") || lowerMsg.includes("tea") || lowerMsg.includes("photo")) {
        if (file.includes("about")) {
          context += content + "\n";
          matchedProjects.push("about");
        }
      }

      if (lowerMsg.includes("fetch") && file.includes("fetch")) {
        context += content + "\n";
        matchedProjects.push("fetch");
      }

      if (lowerMsg.includes("dashboard") || lowerMsg.includes("truck") || lowerMsg.includes("oshkosh") || lowerMsg.includes("saas") || lowerMsg.includes("b2b")) {
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

      if (lowerMsg.includes("website") || lowerMsg.includes("redesign") || lowerMsg.includes("webredesign")) {
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
You are Yilin Chen, a UX/Product Designer.
You are chatting with someone visiting your portfolio website. Answer questions as if you are personally introducing yourself and your work.

About you:
- Graduate student in Information Science at UW–Madison
- Background in interior and landscape design, giving you strong visual sensitivity and systems thinking
- Focus on UX, product design, and AI-driven tools
- Experienced in dashboards, platform redesign, and AI-related products
- Strong at simplifying complex systems into intuitive, human-centered experiences

Interests and personality:
- You enjoy photography and often capture nature and everyday moments, which influences your visual storytelling
- You play the guzheng, a traditional Chinese instrument, which shapes your sense of rhythm and flow in design
- You enjoy baking and experimenting with new recipes, which reflects your iterative and detail-oriented mindset
- You appreciate tea culture and slow, mindful experiences
- You are curious, observant, and enjoy exploring both digital and physical environments

Use the following context to answer:

${context}

Rules:
- Answer in first person ("I")
- Be conversational, warm, and natural — like talking to a real person, not an AI
- Be concise — keep responses to 2-3 sentences max
- No bullet points or lists, just natural short sentences
- When relevant, connect answers to your projects or experiences
- Occasionally weave in your interests if it feels natural (not forced)
- If not relevant, say "I don't have experience with that yet"
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

    // 🔗 根据回复内容检测提到的项目，自动附上链接
    const projectKeywords = {
      fetch: ["fetch"],
      oshkosh: ["oshkosh"],
      mapwa: ["mapwa"],
      lyntra: ["lyntra"],
      webredesign: ["web redesign", "webredesign", "website redesign"],
      vrgame: ["vr game", "vrgame", "vr"],
      photography: ["photography", "photo", "photographer"],
    };

    const lowerReply = reply.toLowerCase();
    const mentionedProjects = Object.entries(projectKeywords)
      .filter(([, keywords]) => keywords.some(kw => lowerReply.includes(kw)))
      .map(([key]) => key);

    if (mentionedProjects.length > 0) {
      const links = mentionedProjects
        .map(p => `\n🔗 <a href="${projectLinks[p]}" target="_blank">View ${p} project</a>`)
        .join("");
      reply += "\n" + links;
    }

    return Response.json({ reply });

  } catch (error) {
    console.error(error);
    return Response.json({ reply: "Error occurred" }, { status: 500 });
  }
}