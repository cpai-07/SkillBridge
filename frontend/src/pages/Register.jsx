import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { errMsg } from "../api";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
    company: "",
  });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const u = await register(form);
      nav(u.role === "employer" ? "/employer/jobs/new" : "/profile");
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <form className="card form narrow" onSubmit={submit}>
      <h2>Create your account</h2>
      {error && <p className="error">{error}</p>}
      <div className="segmented" role="radiogroup" aria-label="I am a">
        {["candidate", "employer"].map((r) => (
          <button
            type="button"
            key={r}
            className={form.role === r ? "on" : ""}
            onClick={() => setForm({ ...form, role: r })}
          >
            {r === "candidate" ? "I'm looking for a job" : "I'm hiring"}
          </button>
        ))}
      </div>
      <label>
        Full name
        <input required value={form.name} onChange={set("name")} />
      </label>
      {form.role === "employer" && (
        <label>
          Company name
          <input required value={form.company} onChange={set("company")} />
        </label>
      )}
      <label>
        Email
        <input
          type="email"
          required
          value={form.email}
          onChange={set("email")}
        />
      </label>
      <label>
        Password (min 6 characters)
        <input
          type="password"
          minLength={6}
          required
          value={form.password}
          onChange={set("password")}
        />
      </label>
      <button className="btn">Sign up</button>
      <p className="muted small">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </form>
  );
}
