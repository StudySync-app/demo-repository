import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY
});

export async function summarizeText(text: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: "Summarize study notes clearly and concisely."
      },
      {
        role: "user",
        content: text
      }
    ]
  });

  return completion.choices[0].message.content;
}