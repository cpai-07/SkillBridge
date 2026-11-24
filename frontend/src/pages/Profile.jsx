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

  // State for the "extract skills from CV" box
  const [cvText, setCvText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [cvMsg, setCvMsg] = useState({ type: "", text: "" });

  // Sends the CV text to the server and adds the skills it finds
  const extractSkills = async () => {
    setExtracting(true);
    setCvMsg({ type: "", text: "" });

    try {
      const { data } = await api.post("/skills/extract", { text: cvText });

      // Only add skills that are not already in the list
      const newSkills = data.skills.filter(
        (found) =>
          !form.skills.some(
            (have) => have.toLowerCase() === found.toLowerCase(),
          ),
      );

      setForm({ ...form, skills: [...form.skills, ...newSkills] });

      const how =
        data.source === "ai" ? "found by AI" : "found by keyword search";

      if (newSkills.length === 0) {
        setCvMsg({
          type: "muted",
          text: "No new skills were found in that text.",
        });
      } else {
        setCvMsg({
          type: "success",
          text: `${newSkills.length} new skill(s) added (${how}). Check the list, then click Save profile.`,
        });
      }
    } catch (err) {
      setCvMsg({ type: "error", text: errMsg(err) });
    } finally {
      setExtracting(false);
    }
  };

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
          <div className="cv-box">
            <label htmlFor="cv-text">
              Paste your CV text to find your skills automatically
            </label>
            <textarea
              id="cv-text"
              rows={5}
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste the text of your CV here (30 to 8000 characters)"
            />
            <p className="small muted">
              If the AI service is switched on, the text you paste is sent to
              it. Do not include private details such as your address or phone
              number.
            </p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={extractSkills}
              disabled={extracting || cvText.trim().length < 30}
            >
              {extracting ? "Finding skills..." : "Find my skills"}
            </button>
            {cvMsg.text && (
              <p
                className={cvMsg.type}
                role={cvMsg.type === "error" ? "alert" : "status"}
              >
                {cvMsg.text}
              </p>
            )}
          </div>
          <label>Your skills (these drive your match scores)</label>
          <SkillInput
            value={form.skills}
            onChange={(skills) => setForm({ ...form, skills })}
          />
        </>
      )}
      {msg.text && (
        <p
          className={msg.type}
          role={msg.type === "error" ? "alert" : "status"}
        >
          {msg.text}
        </p>
      )}
      <button className="btn">Save profile</button>
    </form>
  );
}
