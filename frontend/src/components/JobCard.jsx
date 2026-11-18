import { Link } from "react-router-dom";
import MatchMeter from "./MatchMeter.jsx";
import SkillChips from "./SkillChips.jsx";

export default function JobCard({ job }) {
  return (
    <article className="card job-card">
      <div className="job-card-main">
        <Link to={`/jobs/${job._id}`}>
          <h3>{job.title}</h3>
        </Link>
        <p className="muted">
          {job.company} &middot; {job.location} &middot; {job.type}
        </p>
        {job.match ? (
          <SkillChips matched={job.match.matched} missing={job.match.missing} />
        ) : (
          <SkillChips skills={job.requiredSkills} />
        )}
      </div>
      {job.match && <MatchMeter score={job.match.score} />}
    </article>
  );
}
