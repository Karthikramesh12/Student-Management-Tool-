import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import StudentsPage from "../src/page/StudentsPage";
import TrashPage from "../src/page/TrashPage";
import "../src/styles/app.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-icon">✦</span>
            <span className="brand-name">Academix</span>
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/students" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              <span>Students</span>
            </NavLink>

            <NavLink to="/trash" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </span>
              <span>Trash</span>
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <span className="footer-text">Student Registry v1.0</span>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/students" replace />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/trash" element={<TrashPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}