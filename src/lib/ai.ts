const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export async function summarizeText(text: string) {

  console.log("API KEY:", API_KEY ? "Loaded" : "Missing");

  // 🛟 fallback if no API key
  if (!API_KEY) {
    return text.slice(0, 100) + "...";
  }

  try {
    console.log("Sending request to OpenAI...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "Summarize study notes clearly and concisely.",
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    console.log("Response status:", response.status);

    const data = await response.json();

    if (!response.ok) {
      console.log("OPENAI ERROR:", data);

      // 🛟 fallback if API fails
      return text.slice(0, 100) + "...";
    }

    return data.choices?.[0]?.message?.content || text.slice(0, 100) + "...";

  } catch (error) {
    console.log("NETWORK ERROR:", error);

    // 🛟 fallback if network fails
    return text.slice(0, 100) + "...";
  }
}