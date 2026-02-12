"use client";

const EMOJI_LIST = [
  "😊", "😂", "🥰", "😋", "🤤", "👍", "❤️", "🔥",
  "🍜", "🍣", "🥗", "🍕", "🍰", "🌮", "🍲", "🥘",
  "🎉", "😎", "🤗", "😘", "🥺", "😤", "🙌", "💪",
  "☕", "🍺", "🧋", "🍷", "🥂", "🍦", "🧁", "🍩",
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  return (
    <div className="border-t px-4 py-3" style={{ borderColor: "var(--beige-dark)", background: "#fff" }}>
      <div className="mx-auto grid max-w-lg grid-cols-8 gap-2">
        {EMOJI_LIST.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="rounded p-1.5 text-xl hover:bg-gray-100"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
