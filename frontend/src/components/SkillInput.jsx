import { useState } from "react";

// Type a skill and press Enter or comma to add it
export default function SkillInput({
  value,
  onChange,
  placeholder = "Type a skill, press Enter",
  label = "Add a skill",
}) {
  const [text, setText] = useState("");

  const add = () => {
    const s = text.trim().replace(/,$/, "");
    if (s && !value.some((v) => v.toLowerCase() === s.toLowerCase()))
      onChange([...value, s]);
    setText("");
  };

  return (
    <div className="skill-input">
      <div className="chips">
        {value.map((s) => (
          <button
            type="button"
            key={s}
            className="chip removable"
            onClick={() => onChange(value.filter((v) => v !== s))}
            aria-label={`Remove ${s}`}
          >
            {s} &times;
          </button>
        ))}
      </div>
      <input
        value={text}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
    </div>
  );
}
