import { CHIDIDMMA_INSTRUCTIONS } from "./chididmma.js";

export async function generateGeminiReply(
  apiKey,
  messages,
  organizationContext = "",
  model = "gemini-2.5-flash"
) {
  if (!apiKey) throw new Error("Gemini API key missing.");

  const history = messages
    .slice(-12)
    .filter(m => m && typeof m.text === "string" && m.text.trim())
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text.slice(0, 4000) }]
    }));

  if (!history.length) throw new Error("No messages provided.");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: CHIDIDMMA_INSTRUCTIONS +
              "\n\nVERIFIED ASBESOC INFORMATION:\n" +
              organizationContext.slice(0, 16000)
          }]
        },
        contents: history,
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 1000,
          responseMimeType: "application/json",
          responseSchema: { type: "OBJECT", properties: { text: { type: "STRING" }, escalate: { type: "BOOLEAN" } }, required: ["text", "escalate"] }
        }
      }),
      signal: AbortSignal.timeout(20000)
    }
  );

  if (!response.ok) {
    throw new Error("Gemini HTTP " + response.status);
  }

  const data = await response.json();

  const reply = data.candidates?.[0]?.content?.parts
    ?.map(part => part.text || "")
    .join("")
    .trim();

  if (!reply) throw new Error("Gemini returned an empty response.");

  const result = JSON.parse(reply);
  if (typeof result.text !== "string" || !result.text.trim() || typeof result.escalate !== "boolean") throw new Error("Invalid support response");
  return { text: result.text.slice(0, 3600), escalate: result.escalate };
}
