const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function fetchStudents(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}?${query}`);
  return res.json();
}

export async function fetchStudentById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  return res.json();
}

export async function createStudent(data) {
  const res = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateStudent(id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteStudent(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  return res.json();
}

export async function purgeStudent(id) {
  const res = await fetch(`${BASE_URL}/${id}/purge`, { method: "DELETE" });
  return res.json();
}

export async function restoreStudent(id) {
  const res = await fetch(`${BASE_URL}/${id}/restore`, { method: "PATCH" });
  return res.json();
}

export async function fetchDeletedStudents(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/deleted?${query}`);
  return res.json();
}