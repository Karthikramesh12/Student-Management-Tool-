import { useState, useEffect, useCallback } from "react";
import { fetchDeletedStudents, purgeStudent, restoreStudent } from "../service/studentService";
import "../styles/trash.css";

export default function TrashPage() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: "", email: "" });
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [confirming, setConfirming] = useState(null); // { id, action }

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search.name) params.name = search.name;
      if (search.email) params.email = search.email;
      const res = await fetchDeletedStudents(params);
      if (res.responseCode === 1000) {
        setStudents(res.responseData.result.students);
        setPagination(res.responseData.result.pageinate);
      }
    } catch {
      showToast("Failed to load deleted students", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleRestore(id) {
    try {
      const res = await restoreStudent(id);
      if (res.responseCode === 1000) {
        showToast("Student restored successfully");
        loadStudents();
      } else {
        showToast(res.responseMessage || "Restore failed", "error");
      }
    } catch {
      showToast("Restore failed", "error");
    } finally {
      setConfirming(null);
    }
  }

  async function handlePurge(id) {
    try {
      const res = await purgeStudent(id);
      if (res.responseCode === 1000) {
        showToast("Student permanently deleted");
        loadStudents();
      } else {
        showToast(res.responseMessage || "Purge failed", "error");
      }
    } catch {
      showToast("Purge failed", "error");
    } finally {
      setConfirming(null);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    loadStudents();
  }

  return (
    <div className="page">
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {confirming && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <div className="confirm-icon">
              {confirming.action === "purge" ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
              )}
            </div>
            <h3>{confirming.action === "purge" ? "Permanently Delete?" : "Restore Student?"}</h3>
            <p>
              {confirming.action === "purge"
                ? "This action cannot be undone. The student record will be erased forever."
                : "The student will be moved back to the active registry."}
            </p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setConfirming(null)}>Cancel</button>
              <button
                className={confirming.action === "purge" ? "btn-danger" : "btn-success"}
                onClick={() => confirming.action === "purge" ? handlePurge(confirming.id) : handleRestore(confirming.id)}
              >
                {confirming.action === "purge" ? "Delete Forever" : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Trash</h1>
          <p className="page-subtitle">Deleted students — restore or purge permanently</p>
        </div>
        <div className="trash-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
          </svg>
          {pagination?.total ?? 0} records
        </div>
      </div>

      <div className="search-bar-wrapper">
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <div className="search-field">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name..."
              value={search.name}
              onChange={e => setSearch(s => ({ ...s, name: e.target.value }))}
            />
          </div>
          <div className="search-field">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <input
              type="text"
              placeholder="Search by email..."
              value={search.email}
              onChange={e => setSearch(s => ({ ...s, email: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn-search">Search</button>
          <button type="button" className="btn-reset" onClick={() => { setSearch({ name: "", email: "" }); setPage(1); }}>Reset</button>
        </form>
      </div>

      <div className="trash-table-wrapper">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>Loading deleted students...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
            <p>Trash is empty</p>
            <span>No deleted students found</span>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => (
                <tr key={student.id}>
                  <td className="row-num">{(page - 1) * 10 + i + 1}</td>
                  <td data-label="Name">
                    <div className="student-name-cell">
                      <div className="avatar deleted">{student.name?.charAt(0).toUpperCase()}</div>
                      <span>{student.name}</span>
                    </div>
                  </td>
                  <td data-label="Email" className="email-cell">{student.email}</td>
                  <td data-label="Age">{student.age}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action restore"
                        title="Restore student"
                        onClick={() => setConfirming({ id: student.id, action: "restore" })}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 4 23 10 17 10"/>
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                        </svg>
                        Restore
                      </button>
                      <button
                        className="btn-action purge"
                        title="Permanently delete"
                        onClick={() => setConfirming({ id: student.id, action: "purge" })}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14H6L5 6"/>
                        </svg>
                        Purge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="page-btn">← Prev</button>
            <span className="page-info">Page {page} of {pagination.totalPages}</span>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="page-btn">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}