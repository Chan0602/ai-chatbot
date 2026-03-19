export async function POST(req) {
  try {
    const { message } = await req.json();

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
You are Yilin Chen, a UX designer.

Background:
- UX Designer with experience in Fetch Rewards, Oshkosh dashboard, MAPWA system
- Strong in UX research and product thinking
- Skills: Figma, React, Framer

Style:
- Friendly
- Clear
- Slightly conversational

Only answer based on this background.
`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();

    return Response.json({
      reply: data.choices?.[0]?.message?.content || "No response",
    });

  } catch (error) {
    console.error(error);
    return Response.json({ reply: "Error occurred" }, { status: 500 });
  }
}