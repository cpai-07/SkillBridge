import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext.jsx";
import SkillInput from "../components/SkillInput.jsx";

export default function JobForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: "",
    company: user.company || "",
    location: "",
    type: "Full-time",
    salary: "",
    description: "",
    requiredSkills: [],
  });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    if (id)
      api
        .get(`/jobs/${id}`)
        .then((r) =>
          setForm({ ...r.data.job, salary: r.data.job.salary || "" }),
        );
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (id) await api.put(`/jobs/${id}`, form);
      else await api.post("/jobs", form);
      nav("/employer/jobs");
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <form className="card form narrow" onSubmit={submit}>
      <h2>{id ? "Edit job" : "Post a job"}</h2>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <label>
        Job title
        <input required value={form.title} onChange={set("title")} />
      </label>
      <label>
        Company
        <input required value={form.company} onChange={set("company")} />
      </label>
      <label>
        Location
        <input
          required
          value={form.location}
          onChange={set("location")}
          placeholder="e.g. Dublin (Hybrid)"
        />
      </label>
      <div className="two">
        <label>
          Type
          <select value={form.type} onChange={set("type")}>
            {["Full-time", "Part-time", "Contract", "Internship"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Salary (optional)
          <input
            value={form.salary}
            onChange={set("salary")}
            placeholder="e.g. €40k - €50k"
          />
        </label>
      </div>
      <label>
        Description
        <textarea
          required
          rows={6}
          value={form.description}
          onChange={set("description")}
        />
      </label>
      <label>Required skills (candidates are scored against these)</label>
      <SkillInput
        value={form.requiredSkills}
        onChange={(requiredSkills) => setForm({ ...form, requiredSkills })}
      />
      <button className="btn">{id ? "Save changes" : "Publish job"}</button>
    </form>
  );
}
