import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import MatchMeter from "../components/MatchMeter.jsx";
import SkillChips from "../components/SkillChips.jsx";

export default function Home() {
  const { user } = useAuth();
  return (
    <section className="hero">
      <div>
        <h1>See how well you fit a job before you apply.</h1>
        <p className="lead">
          SkillBridge compares your skills with what each employer asks for,
          shows your match score, and tells you exactly which skills to learn
          next.
        </p>
        <div className="row">
          <Link className="btn btn-lg" to="/jobs">
            Browse jobs
          </Link>
          {!user && (
            <Link className="btn btn-lg btn-ghost" to="/register">
              Create an account
            </Link>
          )}
        </div>
      </div>

      <div className="card demo" aria-label="Example of a match result">
        <p className="muted small">Example: Junior Full-Stack Developer</p>
        <SkillChips
          matched={["javascript", "react", "git"]}
          missing={["node.js", "mongodb"]}
        />
        <MatchMeter score={60} label="match, 2 skills to learn" />
        <p className="small muted">
          Filled chips are skills you have. Dashed chips are the gap.
        </p>
      </div>
    </section>
  );
}
