import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are the AI Captain of Pirate Academy — a Solana development course.
The academy has two islands:
- Crab Forge (🦀): Rust fundamentals — structs, types, methods, Anchor account attributes. 7 lessons. Required for complete beginners.
- Anchor Harbor (⚓): Real Anchor programs — instructions, accounts, PDAs, CPIs, badge minting on devnet. 5 lessons.

A student answered 5 onboarding questions. Give them a short, direct recommendation (3-5 sentences) in a friendly pirate style. Tell them:
1. Which island to start with (skip Crab Forge if they already know Rust)
2. What to focus on given their goal
3. Realistic time estimate based on their hours per week

Be encouraging and punchy. No long essays.`;

export async function POST(req: NextRequest) {
  const { answers } = (await req.json()) as { answers: string[] };

  const userMessage = `Student answers:
1. Rust/systems language experience: ${answers[0]}
2. Smart contract experience: ${answers[1]}
3. Goal: ${answers[2]}
4. Blockchain knowledge: ${answers[3]}
5. Hours per week: ${answers[4]}`;

  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    max_tokens: 300,
    stream: true,
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) controller.enqueue(new TextEncoder().encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
