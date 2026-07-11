import { chatbotConfig } from "@/lib/chatbotConfig";

const FAQ_REPLIES = [
  {
    keys: ["internship", "internships", "browse", "opening", "job"],
    reply:
      "You can browse certificate-eligible internships on the Internships page. Filter by domain, mode, and stipend — then apply with your Lerbo Tech profile.",
  },
  {
    keys: ["certificate", "certify", "certified"],
    reply:
      "To get your internship certificate: apply to a verified internship, complete verification, finish the internship, then download your official Lerbo Tech certificate. You can also apply via Get Certificate.",
  },
  {
    keys: ["register", "sign up", "account", "create"],
    reply:
      "Create a free account as Student, Startup, or Institution from the Register page. Students never pay to apply or earn certificates.",
  },
  {
    keys: ["startup", "hire", "post"],
    reply:
      "Startups can post internships for free, review verified applicants, and mark completion so students receive certificates.",
  },
  {
    keys: ["college", "institution", "campus", "placement"],
    reply:
      "Institutions get a free campus dashboard to share verified internships and track which students get certified.",
  },
  {
    keys: ["human", "agent", "support", "help desk", "contact"],
    reply: chatbotConfig.humanHandoff,
  },
  {
    keys: ["price", "cost", "fee", "paid", "free"],
    reply:
      "Lerbo Tech is free for students, startups, and institutions. Workshop certificates may have a separate listed fee on the Get Certificate page.",
  },
];

function localFaqReply(text) {
  const q = String(text || "").toLowerCase();
  for (const item of FAQ_REPLIES) {
    if (item.keys.some((k) => q.includes(k))) return item.reply;
  }
  return `I can help with internships, certificates, registration, and campus placements. Try asking about browsing internships or getting certified.\n\n${chatbotConfig.humanHandoff}`;
}

function buildMessages(history, userText) {
  const msgs = [{ role: "system", content: chatbotConfig.systemPrompt }];
  (history || []).slice(-8).forEach((m) => {
    if (m.role === "user" || m.role === "assistant") {
      msgs.push({ role: m.role, content: m.content });
    }
  });
  msgs.push({ role: "user", content: userText });
  return msgs;
}

async function callOpenRouter(messages) {
  const key = chatbotConfig.openRouterApiKey;
  if (!key) throw new Error("OpenRouter API key missing");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://lerbotech.com",
      "X-Title": chatbotConfig.name,
    },
    body: JSON.stringify({
      model: chatbotConfig.openRouterModel,
      messages,
      temperature: 0.5,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 160)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty OpenRouter response");
  return String(content).trim();
}

async function callGemini(messages) {
  const key = chatbotConfig.geminiApiKey;
  if (!key) throw new Error("Gemini API key missing");

  const system = messages.find((m) => m.role === "system")?.content || "";
  const contents = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const model = chatbotConfig.geminiModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.5, maxOutputTokens: 500 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${errText.slice(0, 160)}`);
  }

  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  if (!content.trim()) throw new Error("Empty Gemini response");
  return content.trim();
}

/**
 * Reply using OpenRouter and/or Gemini based on REACT_APP_CHATBOT_PROVIDER.
 * Falls back to local FAQ when keys are missing or the API fails.
 */
export async function getChatbotReply(userText, history = []) {
  const text = String(userText || "").trim();
  if (!text) return "Please type a message and I’ll help.";

  const messages = buildMessages(history, text);
  const provider = chatbotConfig.provider;
  const errors = [];

  const tryOpenRouter = provider === "openrouter" || provider === "auto";
  const tryGemini = provider === "gemini" || provider === "auto";

  if (tryOpenRouter && chatbotConfig.openRouterApiKey) {
    try {
      return await callOpenRouter(messages);
    } catch (err) {
      errors.push(err?.message || "OpenRouter failed");
      if (provider === "openrouter") return `${localFaqReply(text)}\n\n(AI temporarily unavailable)`;
    }
  }

  if (tryGemini && chatbotConfig.geminiApiKey) {
    try {
      return await callGemini(messages);
    } catch (err) {
      errors.push(err?.message || "Gemini failed");
      if (provider === "gemini") return `${localFaqReply(text)}\n\n(AI temporarily unavailable)`;
    }
  }

  if (errors.length) {
    console.warn("[chatbot]", errors.join(" | "));
  }

  return localFaqReply(text);
}
