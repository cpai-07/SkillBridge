import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { errMsg } from "../api";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const u = await login(form);
      nav(u.role === "employer" ? "/employer/jobs" : "/jobs");
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <form className="card form narrow" onSubmit={submit}>
      <h2>Log in</h2>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <label>
        Email
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </label>
      <button className="btn">Log in</button>
      <p className="muted small">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </form>
  );
}
