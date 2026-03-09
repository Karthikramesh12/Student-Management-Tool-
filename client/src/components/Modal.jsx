import { useState, useEffect } from "react";
import { fetchStudentById, createStudent, updateStudent } from "../service/studentService";
import "../styles/modal.css";

export default function Modal({ studentId, mode: initialMode, onClose, onSuccess, onToast }) {
  const [mode, setMode] = useState(initialMode); // "create" | "edit" | "view"
  const [loading, setLoading] = useState(!!studentId);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", age: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!studentId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchStudentById(studentId);
        if (res.responseCode === 1000) {
          const s = res.responseData.result;
          setStudent(s);
          setForm({ name: s.name, email: s.email, age: s.age });
        } else {
          onToast("Failed to load student details", "error");
          onClose();
        }
      } catch {
        onToast("Failed to load student details", "error");
        onClose();
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId]);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address";
    if (!form.age) errs.age = "Age is required";
    else if (isNaN(form.age) || Number(form.age) < 1 || Number(form.age) > 120) errs.age = "Enter a valid age (1–120)";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim(), age: Number(form.age) };
      let res;
      if (mode === "create") {
        res = await createStudent(payload);
      } else {
        res = await updateStudent(studentId, payload);
      }

      if (res.responseCode === 1000) {
        onSuccess(mode === "create" ? "Student created successfully!" : "Student updated successfully!");
      } else if (res.responseCode === 1009) {
        setErrors({ email: "A student with this email already exists" });
      } else {
        onToast(res.responseMessage || "Operation failed", "error");
      }
    } catch {
      onToast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  }

  const isView = mode === "view";
  const title = mode === "create" ? "Add New Student" : mode === "edit" ? "Edit Student" : "Student Details";

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">

        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              {mode === "create" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              ) : mode === "edit" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </div>
            <h2 className="modal-title">{title}</h2>
          </div>

          <div className="modal-header-actions">
            {studentId && (
              <button
                className={`mode-toggle ${isView ? "to-edit" : "to-view"}`}
                onClick={() => setMode(isView ? "edit" : "view")}
                title={isView ? "Switch to edit mode" : "Switch to view mode"}
              >
                {isView ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    View
                  </>
                )}
              </button>
            )}
            <button className="modal-close" onClick={onClose} title="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">
              <div className="spinner" />
              <span>Loading student...</span>
            </div>
          ) : (
            <>
              {isView && student ? (
                <div className="view-content">
                  <div className="view-avatar">
                    {student.name?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="view-name">{student.name}</h3>
                  <p className="view-email">{student.email}</p>

                  <div className="view-grid">
                    <div className="view-field">
                      <label>Age</label>
                      <span>{student.age}</span>
                    </div>
                    <div className="view-field">
                      <label>Status</label>
                      <span className={`status-badge ${student.status?.toLowerCase()}`}>{student.status}</span>
                    </div>
                    <div className="view-field">
                      <label>Joined</label>
                      <span>{new Date(student.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <div className="view-field">
                      <label>Last Updated</label>
                      <span>{new Date(student.updatedAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <div className="view-field full">
                      <label>Student ID</label>
                      <span className="student-id">{student.id}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="form-content">
                  <div className={`form-group ${errors.name ? "has-error" : ""}`}>
                    <label htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="e.g. Arjun Sharma"
                      value={form.name}
                      onChange={e => handleChange("name", e.target.value)}
                    />
                    {errors.name && <span className="error-msg">{errors.name}</span>}
                  </div>

                  <div className={`form-group ${errors.email ? "has-error" : ""}`}>
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="e.g. arjun@example.com"
                      value={form.email}
                      onChange={e => handleChange("email", e.target.value)}
                    />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>

                  <div className={`form-group ${errors.age ? "has-error" : ""}`}>
                    <label htmlFor="age">Age</label>
                    <input
                      id="age"
                      type="number"
                      placeholder="e.g. 21"
                      min="1"
                      max="120"
                      value={form.age}
                      onChange={e => handleChange("age", e.target.value)}
                    />
                    {errors.age && <span className="error-msg">{errors.age}</span>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!loading && !isView && (
          <div className="modal-footer">
            <button className="btn-cancel-modal" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn-submit" onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <><div className="spinner-sm" /> Saving...</>
              ) : (
                mode === "create" ? "Create Student" : "Save Changes"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}