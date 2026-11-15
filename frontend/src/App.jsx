import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Protected from "./components/Protected.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import Profile from "./pages/Profile.jsx";
import MyApplications from "./pages/MyApplications.jsx";
import SkillGap from "./pages/SkillGap.jsx";
import EmployerJobs from "./pages/EmployerJobs.jsx";
import JobForm from "./pages/JobForm.jsx";
import Applicants from "./pages/Applicants.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          <Route
            path="/profile"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />
          <Route
            path="/applications"
            element={
              <Protected role="candidate">
                <MyApplications />
              </Protected>
            }
          />
          <Route
            path="/skill-gap"
            element={
              <Protected role="candidate">
                <SkillGap />
              </Protected>
            }
          />

          <Route
            path="/employer/jobs"
            element={
              <Protected role="employer">
                <EmployerJobs />
              </Protected>
            }
          />
          <Route
            path="/employer/jobs/new"
            element={
              <Protected role="employer">
                <JobForm />
              </Protected>
            }
          />
          <Route
            path="/employer/jobs/:id/edit"
            element={
              <Protected role="employer">
                <JobForm />
              </Protected>
            }
          />
          <Route
            path="/employer/jobs/:id/applicants"
            element={
              <Protected role="employer">
                <Applicants />
              </Protected>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}
