import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          SkillBridge
        </Link>
        <nav className="nav-links" aria-label="Main">
          <NavLink to="/jobs">Jobs</NavLink>
          {user?.role === "candidate" && (
            <>
              <NavLink to="/skill-gap">Skill gap</NavLink>
              <NavLink to="/applications">My applications</NavLink>
            </>
          )}
          {user?.role === "employer" && (
            <NavLink to="/employer/jobs">My job posts</NavLink>
          )}
          {user && <NavLink to="/profile">Profile</NavLink>}
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="muted small">{user.name}</span>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  nav("/");
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">
                Log in
              </Link>
              <Link className="btn" to="/register">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
