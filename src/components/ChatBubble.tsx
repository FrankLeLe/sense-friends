"use client";

interface ChatBubbleProps {
  role: "ai" | "user";
  content: string;
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isAI = role === "ai";
  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} animate-fade-in`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isAI
            ? "rounded-tl-sm bg-white text-[#2D2016]"
            : "rounded-tr-sm text-white"
        }`}
        style={isAI ? {} : { background: "#FF8A00" }}
      >
        {content}
      </div>
    </div>
  );
}
