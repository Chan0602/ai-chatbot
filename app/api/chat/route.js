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

      if (lowerMsg.includes("dashboard") || lowerMsg.includes("truck") || lowerMsg.includes("oshkosh") || lowerMsg.includes("saas") || lowerMsg.includes("b2b") || lowerMsg.includes("ux design") || lowerMsg.includes("ux")) {
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

      if (lowerMsg.includes("website") || lowerMsg.includes("redesign") || lowerMsg.includes("webredesign") || lowerMsg.includes("ux design") || lowerMsg.includes("ux")) {
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
- Be concise — 2-3 short sentences per paragraph, 1-2 paragraphs max
- Separate paragraphs with a blank line (\n\n)
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

    // 🔗 根据用户提问意图，精准附上对应链接
    const intentLinks = {
      fetch:       ["fetch", "ux research", "research"],
      oshkosh:     ["oshkosh", "dashboard", "truck", "saas", "b2b", "ux design", "ux"],
      mapwa:       ["mapwa", "student", "management system"],
      lyntra:      ["lyntra", "ai tool", "study", "learning"],
      webredesign: ["website redesign", "web redesign", "webredesign", "website", "redesign", "ux design", "ux"],
      vrgame:      ["vr", "vr game", "immersive", "game"],
    };

    const intentLinksExtra = {
      photography: ["yourself", "about you", "who are you", "background", "interest", "photo"],
    };

    const linkedProjects = Object.entries(intentLinks)
      .filter(([, keywords]) => keywords.some(kw => lowerMsg.includes(kw)))
      .map(([key]) => key);

    const linkedExtras = Object.entries(intentLinksExtra)
      .filter(([, keywords]) => keywords.some(kw => lowerMsg.includes(kw)))
      .map(([key]) => key);

    const allLinks = [...linkedProjects, ...linkedExtras];

    const projectMeta = {
      fetch:       { label: "Fetch",         tags: ["UX Research", "Mobile"],        image: "/images/fetch.jpg" },
      oshkosh:     { label: "Oshkosh",        tags: ["SaaS B2B", "Dashboard"],        image: "/images/oshkosh.jpg" },
      mapwa:       { label: "Mapwa",          tags: ["UX Design", "Web"],             image: "/images/mapwa.jpg" },
      lyntra:      { label: "Lyntra",         tags: ["AI", "UX Design"],              image: "/images/lyntra.jpg" },
      webredesign: { label: "Website Redesign", tags: ["Web", "UX Design"],           image: "/images/webredesign.jpg" },
      vrgame:      { label: "VR Game",        tags: ["VR", "UX Design"],              image: "/images/vrgame.jpg" },
      photography: { label: "Photography",   tags: ["Photography"],                   image: "/images/photography.jpg" },
    };

    const links = allLinks.map(p => ({
      label: projectMeta[p]?.label || p,
      url:   projectLinks[p],
      image: projectMeta[p]?.image || null,
      tags:  projectMeta[p]?.tags || [],
    }));

    return Response.json({ reply, links });

  } catch (error) {
    console.error(error);
    return Response.json({ reply: "Error occurred" }, { status: 500 });
  }
}