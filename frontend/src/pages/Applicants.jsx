import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import MatchMeter from "../components/MatchMeter.jsx";
import SkillChips from "../components/SkillChips.jsx";

export default function Applicants() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const load = () =>
    api.get(`/applications/job/${id}`).then((r) => setData(r.data));
  useEffect(() => {
    load();
  }, [id]);

  const setStatus = async (appId, status) => {
    await api.patch(`/applications/${appId}/status`, { status });
    load();
  };

  if (!data) return <p className="muted">Loading...</p>;
  return (
    <>
      <p>
        <Link to="/employer/jobs">&larr; Back to my jobs</Link>
      </p>
      <h1>Applicants for {data.job.title}</h1>
      <p className="muted">
        Ranked by skill match, best first. Required:{" "}
        {data.job.requiredSkills.join(", ")}
      </p>

      {data.applicants.length === 0 ? (
        <p className="muted">No applications yet.</p>
      ) : (
        <div className="stack">
          {data.applicants.map((a) => (
            <article key={a._id} className="card job-card">
              <div className="job-card-main">
                <h3>
                  {a.candidate.name}{" "}
                  <span className={`status ${a.status}`}>{a.status}</span>
                </h3>
                <p className="muted">
                  {a.candidate.headline || a.candidate.email}
                </p>
                <SkillChips
                  matched={a.match.matched}
                  missing={a.match.missing}
                />
                {a.coverLetter && (
                  <p className="small prewrap">{a.coverLetter}</p>
                )}
                <div className="row">
                  <button
                    className="btn btn-sm"
                    onClick={() => setStatus(a._id, "shortlisted")}
                  >
                    Shortlist
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setStatus(a._id, "rejected")}
                  >
                    Reject
                  </button>
                  <a
                    className="btn btn-sm btn-ghost"
                    href={`mailto:${a.candidate.email}`}
                  >
                    Email
                  </a>
                </div>
              </div>
              <MatchMeter score={a.match.score} />
            </article>
          ))}
        </div>
      )}
    </>
  );
}
