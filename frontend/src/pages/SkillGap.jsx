import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext.jsx";
import MatchMeter from "../components/MatchMeter.jsx";

export default function SkillGap() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get("/jobs/skill-gap").then((r) => setData(r.data));
  }, [user]);

  if (!data) return <p className="muted">Loading...</p>;
  const max = data.topMissing[0]?.jobCount || 1;

  return (
    <>
      <h1>Your skill gap</h1>
      {user.skills.length === 0 && (
        <p className="notice">
          Add your skills on your <Link to="/profile">profile</Link> to get
          accurate results.
        </p>
      )}
      <div className="card">
        <MatchMeter
          score={data.averageMatch}
          label={`average match across ${data.totalJobs} jobs`}
        />
      </div>

      <h2>Learn these next</h2>
      <p className="muted">
        Skills most often required by jobs that you do not have yet.
      </p>
      {data.topMissing.length === 0 ? (
        <p className="success">You cover every skill listed on the platform.</p>
      ) : (
        <div className="card">
          {data.topMissing.map((m) => (
            <div key={m.skill} className="gap-row">
              <span className="gap-name">{m.skill}</span>
              <div className="meter-track">
                <div
                  className="meter-fill mid"
                  style={{ width: `${(m.jobCount / max) * 100}%` }}
                />
              </div>
              <span className="muted small">
                {m.jobCount} {m.jobCount === 1 ? "job" : "jobs"}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
