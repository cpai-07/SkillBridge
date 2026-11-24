import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext.jsx";
import JobCard from "../components/JobCard.jsx";

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    type: "",
    sort: "",
  });
  const isCandidate = user?.role === "candidate";

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      setError("");
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v),
      );
      api
        .get("/jobs", { params })
        .then((r) => setJobs(r.data.jobs))
        .catch((err) => setError(errMsg(err)))
        .finally(() => setLoading(false));
    }, 250); // debounce typing
    return () => clearTimeout(t);
  }, [filters, user]);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <>
      <h1>Jobs</h1>
      {!user && (
        <p className="notice">
          <Link to="/register">Sign up as a candidate</Link> to see your match
          score on every job.
        </p>
      )}
      {isCandidate && user.skills.length === 0 && (
        <p className="notice">
          You have no skills on your profile yet.{" "}
          <Link to="/profile">Add your skills</Link> to see match scores.
        </p>
      )}

      <div className="filters">
        <input
          placeholder="Search title, company or skill"
          value={filters.search}
          onChange={set("search")}
        />
        <input
          placeholder="Location"
          value={filters.location}
          onChange={set("location")}
        />
        <select value={filters.type} onChange={set("type")}>
          <option value="">All types</option>
          {["Full-time", "Part-time", "Contract", "Internship"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        {isCandidate && (
          <select value={filters.sort} onChange={set("sort")}>
            <option value="">Newest first</option>
            <option value="match">Best match first</option>
          </select>
        )}
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="muted" role="status">
          Loading jobs...
        </p>
      ) : error ? null : jobs.length === 0 ? (
        <p className="muted">No jobs match your search. Try fewer filters.</p>
      ) : (
        <div className="stack">
          {jobs.map((j) => (
            <JobCard key={j._id} job={j} />
          ))}
        </div>
      )}
    </>
  );
}
