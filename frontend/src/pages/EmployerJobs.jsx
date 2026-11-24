import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api";

export default function EmployerJobs() {
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState("");
  const load = () =>
    api
      .get("/jobs/mine")
      .then((r) => setJobs(r.data.jobs))
      .catch((err) => setError(errMsg(err)));
  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this job and all its applications?")) return;
    try {
      await api.delete(`/jobs/${id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  if (error && !jobs)
    return (
      <p className="error" role="alert">
        {error}
      </p>
    );
  if (!jobs)
    return (
      <p className="muted" role="status">
        Loading...
      </p>
    );
  return (
    <>
      <div className="row between">
        <h1>My job posts</h1>
        <Link className="btn" to="/employer/jobs/new">
          Post a job
        </Link>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {jobs.length === 0 ? (
        <p className="muted">You have not posted any jobs yet.</p>
      ) : (
        <div className="stack">
          {jobs.map((j) => (
            <article key={j._id} className="card job-card">
              <div className="job-card-main">
                <h3>{j.title}</h3>
                <p className="muted">
                  {j.location} &middot; {j.type} &middot; {j.applicantCount}{" "}
                  {j.applicantCount === 1 ? "applicant" : "applicants"}
                </p>
              </div>
              <div className="row">
                <Link
                  className="btn btn-sm"
                  to={`/employer/jobs/${j._id}/applicants`}
                >
                  View applicants
                </Link>
                <Link
                  className="btn btn-sm btn-ghost"
                  to={`/employer/jobs/${j._id}/edit`}
                >
                  Edit
                </Link>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => remove(j._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
