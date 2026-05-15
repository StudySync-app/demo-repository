const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const MODEL = "gpt-4.1-mini";

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

async function runStudySyncAI(messages: ChatMessage[]) {
  if (!API_KEY) {
    throw new Error("Missing OpenAI API key. Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file, then restart Expo with -c.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      messages,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "OpenAI request failed.");
  }

  return cleanAIOutput(data.choices?.[0]?.message?.content?.trim() || "No AI response was returned.");
}

export function cleanAIOutput(value: string) {
  return value
    .replace(/[#*_`>]/g, "")
    .replace(/^\s*[-+]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function summarizeStudyNotes(text: string) {
  return runStudySyncAI([
    { role: "system", content: "Summarize study notes clearly. Use clean plain text only. Do not use markdown, asterisks, hashtags, or decorative formatting." },
    { role: "user", content: text },
  ]);
}

export const summarizeText = summarizeStudyNotes;

export async function generateQuizQuestions(sourceText: string) {
  return runStudySyncAI([
    { role: "system", content: "Create 5 study quiz questions with answers from the provided material." },
    { role: "user", content: sourceText },
  ]);
}

export async function answerStudyQuestion(question: string, context?: string) {
  return runStudySyncAI([
    { role: "system", content: "Answer as a helpful StudySync tutor. Be accurate, brief, and student-friendly." },
    { role: "user", content: context ? `Context:\n${context}\n\nQuestion:\n${question}` : question },
  ]);
}

export async function suggestLearningResources(topic: string) {
  return runStudySyncAI([
    { role: "system", content: "Suggest practical learning resources and study activities. Avoid fake links." },
    { role: "user", content: topic },
  ]);
}

export async function prioritizeTask(task: string) {
  return runStudySyncAI([
    { role: "system", content: "Prioritize this task as urgent, important, or minor, and explain why in one sentence." },
    { role: "user", content: task },
  ]);
}

export async function suggestStudySchedule(tasks: string) {
  return runStudySyncAI([
    { role: "system", content: "Create a realistic short study schedule from these tasks and deadlines." },
    { role: "user", content: tasks },
  ]);
}
