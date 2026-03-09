import "../styles/table.css";

export default function Table({ students, loading, pagination, page, onPageChange, onEdit, onView, onDelete }) {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Fetching students...</span>
      </div>
    );
  }

  if (!loading && students.length === 0) {
    return (
      <div className="empty-state">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <p>No students found</p>
        <span>Try adjusting your search or add a new student</span>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Student</th>
            <th>Email</th>
            <th>Age</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, i) => (
            <tr key={student.id}>
              <td className="row-num">{(page - 1) * 10 + i + 1}</td>
              <td data-label="Student">
                <div className="student-name-cell">
                  <div className="avatar">{student.name?.charAt(0).toUpperCase()}</div>
                  <span>{student.name}</span>
                </div>
              </td>
              <td data-label="Email" className="email-cell">{student.email}</td>
              <td data-label="Age">{student.age}</td>
              <td data-label="Status">
                <span className={`status-badge ${student.status?.toLowerCase()}`}>
                  {student.status}
                </span>
              </td>
              <td data-label="Joined" className="date-cell">
                {new Date(student.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric"
                })}
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn-action view"
                    title="View details"
                    onClick={() => onView(student.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button
                    className="btn-action edit"
                    title="Edit student"
                    onClick={() => onEdit(student.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    className="btn-action delete"
                    title="Delete student"
                    onClick={() => onDelete(student.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(p => p - 1)}
            className="page-btn"
          >
            ← Prev
          </button>
          <span className="page-info">
            Page {page} of {pagination.totalPages}
            <span className="total-count"> · {pagination.total} students</span>
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => onPageChange(p => p + 1)}
            className="page-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}