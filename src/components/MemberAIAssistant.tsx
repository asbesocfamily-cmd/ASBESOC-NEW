import { useEffect, useRef, useState } from "react";

type Message = {
id: number;
role: "assistant" | "user";
text: string;
};

const suggestions = [
"What is ASBESOC?",
"How do I become a member?",
"How do certificates work?",
"How can I access training?",
];

function getAnswer(question: string): string {
const q = question.toLowerCase();

if (
q.includes("hello") ||
q === "hi" ||
q.startsWith("hi ") ||
q.includes("good morning") ||
q.includes("good afternoon") ||
q.includes("good evening")
) {
return "Hello! 💚 Welcome to ASBESOC Nigeria. How can I help you today?";
}

if (
q.includes("what is asbesoc") ||
q.includes("about asbesoc") ||
q.includes("organization")
) {
return "ASBESOC stands for Association for a Better Society. We focus on community development, peacebuilding, human rights, empowerment, and related initiatives.";
}

if (
q.includes("join") ||
q.includes("become a member") ||
q.includes("membership application")
) {
return "To join ASBESOC, create an account, verify your email, and complete the membership application. Your application will be reviewed before a decision is made.";
}

if (
q.includes("certificate") ||
q.includes("membership payment") ||
q.includes("pay")
) {
return "After your membership application is approved, you may need to purchase your membership certificate. Use only the official payment options shown on the ASBESOC website. Never send money to an unofficial account.";
}

if (
q.includes("training") ||
q.includes("course") ||
q.includes("learn")
) {
return "ASBESOC training opportunities are intended for eligible members with the required membership certification. Check your member dashboard for announcements when training opportunities become available.";
}

if (
q.includes("application status") ||
q.includes("approved") ||
q.includes("pending")
) {
return "You can check your application status from your member dashboard. If you need clarification about a decision, contact ASBESOC support.";
}

if (
q.includes("contact") ||
q.includes("support") ||
q.includes("human")
) {
return "For assistance with account issues, official decisions, or other specific matters, please use the Member Chat or Contact section of the ASBESOC website.";
}

return "I don't have a verified answer to that question yet. Please contact ASBESOC support through Member Chat for further assistance.";
}

export default function MemberAIAssistant() {
const [messages, setMessages] = useState<Message[]>([
{
id: 1,
role: "assistant",
text: "Hello! 💚 I'm Miss Chididmma, your ASBESOC support assistant. I can help you understand membership, certificates, training opportunities, and ASBESOC services. What would you like to know?",
},
]);

const [input, setInput] = useState("");
const [typing, setTyping] = useState(false);

const bottomRef = useRef<HTMLDivElement>(null);
const nextId = useRef(2);

useEffect(() => {
bottomRef.current?.scrollIntoView({
behavior: "smooth",
block: "end",
});
}, [messages, typing]);

function sendMessage(value?: string) {
const question = (value ?? input).trim();

if (!question || typing) return;

const userMessage: Message = {
  id: nextId.current++,
  role: "user",
  text: question,
};

setMessages((previous) => [...previous, userMessage]);
setInput("");
setTyping(true);

// Temporary FAQ reply. The secure Gemini backend connection
// will replace this local response in the next integration step.
const reply = getAnswer(question);

Promise.resolve().then(() => {
  setMessages((previous) => [
    ...previous,
    {
      id: nextId.current++,
      role: "assistant",
      text: reply,
    },
  ]);
  setTyping(false);
});

}

return (
<div className="mx-auto w-full max-w-5xl">
<div className="mb-6">
<h1 className="text-2xl font-bold text-gray-900">
ASBESOC AI Assistant
</h1>
<p className="mt-2 text-sm text-gray-600">
Your guide to ASBESOC membership and services.
</p>
</div>

  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="flex items-center gap-3 bg-green-800 px-5 py-5 text-white">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-xl font-bold text-green-800">
        M
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="font-bold">Miss Chididmma</h2>
        <p className="text-xs text-green-100">
          ASBESOC support assistant
        </p>
      </div>

      <span className="rounded-full bg-green-700 px-3 py-1 text-xs">
        FAQ Mode
      </span>
    </div>

    <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-xs text-amber-900">
      This assistant currently uses verified, predefined answers.
      Live Gemini responses are not connected yet.
    </div>

    <div
      className="h-[420px] space-y-5 overflow-y-auto bg-gray-50 p-5"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === "user"
              ? "justify-end"
              : "justify-start"
          }`}
        >
          <div
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
              message.role === "user"
                ? "rounded-br-sm bg-green-700 text-white"
                : "rounded-bl-sm border border-gray-100 bg-white text-gray-800"
            }`}
          >
            {message.text}
          </div>
        </div>
      ))}

      {typing && (
        <div
          className="flex justify-start"
          role="status"
          aria-label="Assistant is preparing a reply"
        >
          <div className="rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
            Miss Chididmma is typing...
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>

    <div className="border-t border-gray-100 bg-white p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Suggested questions
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={typing}
            onClick={() => sendMessage(suggestion)}
            className="rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-800 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
        className="flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about ASBESOC..."
          maxLength={1000}
          aria-label="Your message"
          className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />

        <button
          type="submit"
          disabled={!input.trim() || typing}
          className="rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>

      <p className="mt-3 text-center text-xs text-gray-400">
        For official decisions, payments, or account issues,
        please contact ASBESOC support.
      </p>
    </div>
  </div>
</div>

);
}
