import { useState, useEffect, useCallback } from "react";
import Table from "../components/Table";
import Modal from "../components/Modal";
import { fetchStudents, deleteStudent } from "../service/studentService";
import "../styles/students.css";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: "", email: "" });
  const [page, setPage] = useState(1);
  const [modalState, setModalState] = useState({ open: false, studentId: null, mode: "create" });
  const [toast, setToast] = useState(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search.name) params.name = search.name;
      if (search.email) params.email = search.email;
      const res = await fetchStudents(params);
      if (res.responseCode === 1000) {
        setStudents(res.responseData.result.students);
        setPagination(res.responseData.result.pageinate);
      }
    } catch (err) {
      showToast("Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleDelete(id) {
    if (!window.confirm("Move this student to trash?")) return;
    try {
      const res = await deleteStudent(id);
      if (res.responseCode === 1000) {
        showToast("Student moved to trash");
        loadStudents();
      } else {
        showToast(res.responseMessage || "Delete failed", "error");
      }
    } catch {
      showToast("Delete failed", "error");
    }
  }

  function openCreate() {
    setModalState({ open: true, studentId: null, mode: "create" });
  }

  function openEdit(id) {
    setModalState({ open: true, studentId: id, mode: "edit" });
  }

  function openView(id) {
    setModalState({ open: true, studentId: id, mode: "view" });
  }

  function closeModal() {
    setModalState({ open: false, studentId: null, mode: "create" });
  }

  function handleModalSuccess(msg) {
    showToast(msg);
    closeModal();
    loadStudents();
  }

  function handleSearch(e) {
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

      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">Manage your student registry</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Student
        </button>
      </div>

      <div className="search-bar-wrapper">
        <form className="search-bar" onSubmit={handleSearch}>
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

      <Table
        students={students}
        loading={loading}
        pagination={pagination}
        page={page}
        onPageChange={setPage}
        onEdit={openEdit}
        onView={openView}
        onDelete={handleDelete}
      />

      {modalState.open && (
        <Modal
          studentId={modalState.studentId}
          mode={modalState.mode}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
          onToast={showToast}
        />
      )}
    </div>
  );
}