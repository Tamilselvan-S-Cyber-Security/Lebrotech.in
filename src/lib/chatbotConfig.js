/** Internship chatbot config from .env (REACT_APP_*). */

function env(key, fallback = "") {
  const v = process.env[key];
  return v == null || String(v).trim() === "" ? fallback : String(v).trim();
}

function parseCommonMessages(raw) {
  return String(raw || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [label, path] = part.split("|").map((s) => s.trim());
      return { label: label || part, path: path || "/opportunities" };
    });
}

export const chatbotConfig = {
  enabled: env("REACT_APP_CHATBOT_ENABLED", "true") !== "false",
  name: env("REACT_APP_CHATBOT_NAME", "Internship chatbot"),
  agentLabel: env("REACT_APP_CHATBOT_AGENT_LABEL", "AI Agent 1"),
  provider: env("REACT_APP_CHATBOT_PROVIDER", "auto").toLowerCase(),
  openRouterApiKey: env("REACT_APP_OPENROUTER_API_KEY"),
  openRouterModel: env("REACT_APP_OPENROUTER_MODEL", "google/gemini-2.0-flash-001"),
  geminiApiKey: env("REACT_APP_GEMINI_API_KEY"),
  geminiModel: env("REACT_APP_GEMINI_MODEL", "gemini-2.0-flash"),
  greeting: env(
    "REACT_APP_CHATBOT_GREETING",
    "Hello! I am Internship chatbot. How can I help you today?"
  ),
  humanHandoff: env(
    "REACT_APP_CHATBOT_HUMAN_HANDOFF",
    "If you'd like to speak with a human agent, please use the Contact page or email support@lerbotech.com."
  ),
  commonMessages: parseCommonMessages(
    env(
      "REACT_APP_CHATBOT_COMMON_MESSAGES",
      "Browse internships|/opportunities;Get certificate|/apply-certificate;How it works|/students;Contact support|/contact"
    )
  ),
  systemPrompt: env(
    "REACT_APP_CHATBOT_SYSTEM_PROMPT",
    `You are Lerbo Tech Internship chatbot. Help students find verified internships, certificates, registration, and campus placement info.
Be concise, friendly, and practical. Prefer short answers (2–5 sentences).
Key facts: Lerbo Tech is free for students, startups, and institutions. Students apply → verify → complete internship → get certificate.
Useful paths: /opportunities (browse), /apply-certificate (certificate), /register (create account), /students (student portal), /contact (support).
If the user asks for a human, direct them to /contact.`
  ),
};

export function chatbotHasLiveAi() {
  return Boolean(chatbotConfig.openRouterApiKey || chatbotConfig.geminiApiKey);
}
