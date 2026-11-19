import { useState } from "react";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext.jsx";
import SkillInput from "../components/SkillInput.jsx";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || "",
    headline: user.headline || "",
    bio: user.bio || "",
    company: user.company || "",
    skills: user.skills || [],
  });
  const [msg, setMsg] = useState({ type: "", text: "" });

  const save = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/auth/profile", form);
      setUser(data.user);
      setMsg({ type: "success", text: "Profile saved" });
    } catch (err) {
      setMsg({ type: "error", text: errMsg(err) });
    }
  };

  return (
    <form className="card form narrow" onSubmit={save}>
      <h2>Your profile</h2>
      <p className="muted small">
        {user.email} &middot; {user.role}
      </p>
      <label>
        Full name
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </label>
      {user.role === "employer" ? (
        <label>
          Company
          <input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </label>
      ) : (
        <>
          <label>
            Headline
            <input
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="e.g. Aspiring full-stack developer"
            />
          </label>
          <label>
            About you
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </label>
          <label>Your skills (these drive your match scores)</label>
          <SkillInput
            value={form.skills}
            onChange={(skills) => setForm({ ...form, skills })}
          />
        </>
      )}
      {msg.text && <p className={msg.type}>{msg.text}</p>}
      <button className="btn">Save profile</button>
    </form>
  );
}
