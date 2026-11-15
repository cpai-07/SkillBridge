// Horizontal meter showing how well a candidate matches a job
export const matchLevel = (score) =>
  score >= 75 ? "high" : score >= 40 ? "mid" : "low";

export default function MatchMeter({ score, label = "match" }) {
  return (
    <div className="meter" role="img" aria-label={`${score}% ${label}`}>
      <div className="meter-top">
        <strong className={`meter-score ${matchLevel(score)}`}>{score}%</strong>
        <span className="muted small">{label}</span>
      </div>
      <div className="meter-track">
        <div
          className={`meter-fill ${matchLevel(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
