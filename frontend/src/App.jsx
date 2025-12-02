import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import AuthSuccess from "./pages/AuthSuccess";
import NexiPage from "./pages/NexiPage";
import PostHistory from "./pages/PostHistory";
import Drafts from "./pages/Drafts";

export default function App() {
  const token = localStorage.getItem("token");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/nexi"
          element={token ? <NexiPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/history"
          element={token ? <PostHistory /> : <Navigate to="/login" />}
        />
        <Route
          path="/drafts"
          element={token ? <Drafts /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
