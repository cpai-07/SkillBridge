import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext.jsx";
import MatchMeter from "../components/MatchMeter.jsx";
import SkillChips from "../components/SkillChips.jsx";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    api
      .get(`/jobs/${id}`)
      .then((r) => setJob(r.data.job))
      .catch((e) => setError(errMsg(e)));
  }, [id, user]);

  const apply = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/applications/${id}`, { coverLetter });
      setDone(true);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  if (error && !job)
    return (
      <p className="error" role="alert">
        {error}
      </p>
    );
  if (!job)
    return (
      <p className="muted" role="status">
        Loading...
      </p>
    );
  const applied = done || job.hasApplied;

  return (
    <div className="detail">
      <div className="card">
        <h1>{job.title}</h1>
        <p className="muted">
          {job.company} &middot; {job.location} &middot; {job.type}
          {job.salary ? ` · ${job.salary}` : ""}
        </p>
        <h3>About the role</h3>
        <p className="prewrap">{job.description}</p>
        <h3>Required skills</h3>
        <SkillChips skills={job.requiredSkills} />
      </div>

      <aside className="card side">
        {job.match ? (
          <>
            <MatchMeter
              score={job.match.score}
              label="match with your skills"
            />
            <h4>You have</h4>
            {job.match.matched.length ? (
              <SkillChips matched={job.match.matched} />
            ) : (
              <p className="muted small">None of the required skills yet.</p>
            )}
            <h4>Skills to learn</h4>
            {job.match.missing.length ? (
              <SkillChips missing={job.match.missing} />
            ) : (
              <p className="small">You have every required skill.</p>
            )}
          </>
        ) : !user ? (
          <p>
            <Link to="/login">Log in</Link> as a candidate to see how you match.
          </p>
        ) : null}

        {user?.role === "candidate" &&
          (applied ? (
            <div>
              <p className="success">&#10003; Application sent</p>
              <p>
                Status:{" "}
                <span className={`status ${job.applicationStatus || "applied"}`}>
                  {job.applicationStatus || "applied"}
                </span>
              </p>
              {job.applicationStatus === "rejected" && (
                <p className="muted small">
                  The employer did not shortlist this application.
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={apply} className="form">
              <label>
                Cover letter (optional)
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </label>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <button className="btn">Apply now</button>
            </form>
          ))}
        {user?.role === "employer" && (
          <p className="muted small">Employers cannot apply to jobs.</p>
        )}
      </aside>
    </div>
  );
}
