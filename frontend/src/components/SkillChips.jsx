// matched = skills you have, missing = skills you lack, skills = neutral list
export default function SkillChips({
  matched = [],
  missing = [],
  skills = [],
}) {
  return (
    <div className="chips">
      {matched.map((s) => (
        <span key={s} className="chip have" title="You have this">
          &#10003; {s}
        </span>
      ))}
      {missing.map((s) => (
        <span key={s} className="chip miss" title="Missing skill">
          {s}
        </span>
      ))}
      {skills.map((s) => (
        <span key={s} className="chip">
          {s}
        </span>
      ))}
    </div>
  );
}
