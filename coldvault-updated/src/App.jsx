import { useState } from "react";
import { LandingPage } from "./pages/Landing/LandingPage.jsx";
import { Dashboard } from "./pages/Dashboard/Dashboard.jsx";
import { LoginPage } from "./pages/Login/LoginPage.jsx";
import { SignupPage } from "./pages/Login/SignupPage.jsx";
import { login, signup } from "./api/api.js";

export default function App() {
  const [view, setView] = useState("landing");
  const [loginError, setLoginError] = useState("");
  const [currentAdmin, setCurrentAdmin] = useState(null);

  const handleLogin = async (username, password) => {
    try {
      const res = await login({ username, password });
      // Keep a reliable password in session even if backend omits it.
      setCurrentAdmin({ ...res.data, password: res.data?.password ?? password });
      setLoginError("");
      setView("dashboard");
    } catch (err) {
      setLoginError(err.response?.data?.error || "Invalid username or password");
    }
  };

  const handleSignup = async (data) => {
    try {
      const res = await signup(data);
      // FIX 3: After signup, store password in session so PasswordModal works immediately
      setCurrentAdmin({ ...res.data, password: data.password });
      setLoginError("");
      setView("dashboard");
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = () => {
    setCurrentAdmin(null);
    setView("landing");
  };

  if (view === "landing") return <LandingPage onEnterDashboard={() => setView("login")} />;
  if (view === "login") return (
    <LoginPage
      onLogin={handleLogin}
      onBack={() => setView("landing")}
      onGoSignup={() => setView("signup")}
      error={loginError}
      setError={setLoginError}
    />
  );
  if (view === "signup") return (
    <SignupPage
      onSignup={handleSignup}
      onBack={() => setView("login")}
    />
  );

  return <Dashboard admin={currentAdmin} onBack={handleLogout} />;
}