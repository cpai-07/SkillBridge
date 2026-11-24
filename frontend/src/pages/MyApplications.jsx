import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api";
import MatchMeter from "../components/MatchMeter.jsx";

export default function MyApplications() {
  const [apps, setApps] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/applications/mine")
      .then((r) => setApps(r.data.applications))
      .catch((err) => setError(errMsg(err)));
  }, []);

  if (error)
    return (
      <p className="error" role="alert">
        {error}
      </p>
    );
  if (!apps)
    return (
      <p className="muted" role="status">
        Loading...
      </p>
    );
  return (
    <>
      <h1>My applications</h1>
      {apps.length === 0 ? (
        <p className="muted">
          You have not applied to any jobs yet.{" "}
          <Link to="/jobs">Browse jobs</Link>
        </p>
      ) : (
        <div className="stack">
          {apps.map((a) => (
            <article key={a._id} className="card job-card">
              <div className="job-card-main">
                <Link to={`/jobs/${a.job._id}`}>
                  <h3>{a.job.title}</h3>
                </Link>
                <p className="muted">
                  {a.job.company} &middot; applied{" "}
                  {new Date(a.createdAt).toLocaleDateString("en-IE")}
                </p>
                <span className={`status ${a.status}`}>{a.status}</span>
              </div>
              <MatchMeter score={a.matchScore} label="match when applied" />
            </article>
          ))}
        </div>
      )}
    </>
  );
}
