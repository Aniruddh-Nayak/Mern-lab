import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function App() {
  // Theme State ('dark' default)
  const [theme, setTheme] = useState(() => localStorage.getItem("portal_theme") || "dark");

  useEffect(() => {
    localStorage.setItem("portal_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  }

  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("mern_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("mern_token") || "");

  // Form State
  const [mode, setMode] = useState("signup"); // 'signup' | 'login'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  // Dashboard State (Home Page)
  const [pingStatus, setPingStatus] = useState(null);
  const [pingLoading, setPingLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("mern_notes");
      return saved ? JSON.parse(saved) : ["Welcome to your dashboard!", "Account verified."];
    } catch {
      return [];
    }
  });
  const [newNote, setNewNote] = useState("");

  // Persist notes
  useEffect(() => {
    localStorage.setItem("mern_notes", JSON.stringify(notes));
  }, [notes]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError(false);
    setBusy(true);

    try {
      const response = await fetch(`${API}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed");

      // Save user session
      localStorage.setItem("mern_user", JSON.stringify(data.user));
      localStorage.setItem("mern_token", data.token);
      setUser(data.user);
      setToken(data.token);
      setPassword("");
    } catch (err) {
      setError(true);
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setMessage("Backend server is not running on port 5000. Please run 'npm start' in part-b-signup/server.");
      } else {
        setMessage(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("mern_user");
    localStorage.removeItem("mern_token");
    setUser(null);
    setToken("");
    setMessage("Signed out successfully.");
    setError(false);
  }

  function switchMode(newMode) {
    setMode(newMode);
    setMessage("");
    setError(false);
  }

  // Dashboard Actions
  async function testApiHealth() {
    setPingLoading(true);
    const start = performance.now();
    try {
      const res = await fetch(`${API}/health`);
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        setPingStatus({ ok: true, text: `200 OK (${elapsed}ms) - API Online` });
      } else {
        setPingStatus({ ok: false, text: "API returned an error" });
      }
    } catch {
      setPingStatus({ ok: false, text: "Backend unreachable on port 5000" });
    } finally {
      setPingLoading(false);
    }
  }

  function addNote(e) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes(prev => [newNote.trim(), ...prev]);
    setNewNote("");
  }

  function deleteNote(index) {
    setNotes(prev => prev.filter((_, i) => i !== index));
  }

  // Theme Toggle Button Component
  const ThemeToggleButton = (
    <button
      type="button"
      className="btn-theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      )}
    </button>
  );

  // ==========================================
  // VIEW: AUTHENTICATED HOMEPAGE / DASHBOARD
  // ==========================================
  if (user) {
    const userInitial = user.email ? user.email.charAt(0).toUpperCase() : "U";
    const username = user.email ? user.email.split("@")[0] : "User";

    return (
      <div className="dashboard-page">
        {/* Navigation Bar */}
        <nav className="dash-nav">
          <div className="nav-container">
            <div className="nav-brand">
              <div className="nav-logo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <span className="brand-name">PortalHub</span>
            </div>

            <div className="nav-user">
              {ThemeToggleButton}
              <div className="user-pill">
                <span className="user-avatar">{userInitial}</span>
                <span className="user-email">{user.email}</span>
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Sign Out">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <main className="dash-content">
          {/* Welcome Banner */}
          <section className="welcome-banner">
            <div>
              <h1 className="welcome-title">Welcome back, {username}!</h1>
              <p className="welcome-sub">You are signed in to your account workspace.</p>
            </div>
          </section>

          {/* Quick Metrics Grid */}
          <section className="dash-grid">
            {/* Card 1: Account Info */}
            <div className="dash-card">
              <div className="card-top">
                <div className="dash-card-icon icon-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span className="card-tag">Account Profile</span>
              </div>
              <h3 className="dash-card-title">User Credentials</h3>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-val">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">MongoDB ID</span>
                  <span className="info-val font-mono">{user.id || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Auth Token</span>
                  <button 
                    type="button" 
                    className="token-toggle-btn" 
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? "Hide Token" : "Inspect Token"}
                  </button>
                </div>
              </div>
              {showToken && (
                <div className="jwt-preview">
                  <code>{token}</code>
                </div>
              )}
            </div>

            {/* Card 2: Security & Backend */}
            <div className="dash-card">
              <div className="card-top">
                <div className="dash-card-icon icon-emerald">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <span className="card-tag">System Status</span>
              </div>
              <h3 className="dash-card-title">Backend & Database</h3>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Password Hash</span>
                  <span className="info-val badge-green">bcrypt (12 rounds)</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Database</span>
                  <span className="info-val">MongoDB</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Session</span>
                  <span className="info-val">JWT Active</span>
                </div>
              </div>
              <div className="api-test-box">
                <button 
                  onClick={testApiHealth} 
                  disabled={pingLoading} 
                  className="btn-ping"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  <span>{pingLoading ? "Checking..." : "Ping API Health"}</span>
                </button>
                {pingStatus && (
                  <span className={`ping-result ${pingStatus.ok ? "ping-ok" : "ping-err"}`}>
                    {pingStatus.text}
                  </span>
                )}
              </div>
            </div>

            {/* Card 3: Interactive Workspace / Quick Notes */}
            <div className="dash-card dash-card--wide">
              <div className="card-top">
                <div className="dash-card-icon icon-purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <span className="card-tag">Workspace</span>
              </div>
              <h3 className="dash-card-title">Quick Notes</h3>
              <p className="card-desc">Personal notes stored in your browser session.</p>

              <form onSubmit={addNote} className="note-input-row">
                <input
                  type="text"
                  placeholder="Type a note and hit enter..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="input-note"
                />
                <button type="submit" className="btn-add-note">Add Note</button>
              </form>

              <ul className="notes-list">
                {notes.length === 0 ? (
                  <li className="note-empty">No notes yet. Add your first note above!</li>
                ) : (
                  notes.map((item, idx) => (
                    <li key={idx} className="note-item">
                      <span>{item}</span>
                      <button 
                        type="button" 
                        onClick={() => deleteNote(idx)} 
                        className="btn-del-note"
                        title="Delete note"
                      >
                        ×
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ==========================================
  // VIEW: AUTHENTICATION (SIGN UP / LOG IN)
  // ==========================================
  return (
    <div className="auth-page">
      <div className="auth-top-controls">
        {ThemeToggleButton}
      </div>

      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1 className="auth-title">PortalHub</h1>
        </div>

        {/* Tab Switcher */}
        <div className="tab-switcher">
          <button
            type="button"
            className={`tab-btn ${mode === "login" ? "tab-btn--active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === "signup" ? "tab-btn--active" : ""}`}
            onClick={() => switchMode("signup")}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@domain.com"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={mode === "signup" ? "Min. 8 characters" : "Enter password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={mode === "signup" ? 8 : 1}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {mode === "signup" && (
              <span className="field-hint">Must contain at least 8 characters.</span>
            )}
          </div>

          <button className="btn-auth-submit" type="submit" disabled={busy}>
            {busy ? "Authenticating..." : mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Message Banner */}
        {message && (
          <div className={`auth-alert ${error ? "auth-alert--error" : "auth-alert--success"}`}>
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
