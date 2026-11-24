// matched = skills you have, missing = skills you lack, skills = neutral list

export default function SkillChips({
  matched = [],
  missing = [],
  skills = [],
}) {
  return (
    <div className="chips">
      {matched.map((s) => (
        <span key={s} className="chip have">
          <span className="sr-only">You have: </span>
          &#10003; {s}
        </span>
      ))}
      {missing.map((s) => (
        <span key={s} className="chip miss">
          <span className="sr-only">Missing: </span>
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
