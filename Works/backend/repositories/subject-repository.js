// Data Access Layer
import pool from "../db/pool.js";

export async function findAll() {
  const [subject] = await pool.query("SELECT * FROM subjects");
  return subject;
}

export async function findById(id) {
  const [rows] = await pool.query("SELECT * FROM subjects WHERE id = ?", [id]);
  if (rows.length === 0) return null;
  return rows[0];
}

export async function create(subject) {
  const [result] = await pool.query(
    "INSERT INTO subjects (subject_code , subject_title , credit) VALUES (?,?,?)",
    [subject.code, subject.title, subject.credit],
  );
  if (result.affectedRows === 0) return null;
  return findById(result.insertId);
}

export async function updateSubject(id, subject) {
  const [result] = await pool.query(
    "UPDATE subjects SET subject_code = ? , subject_title = ? , credit = ? WHERE id = ?",
    [subject.code, subject.title, subject.credit, id],
  );
  if (result.affectedRows === 0) return null;
  return findById(id);
}

export async function remove(id) {
  const [result] = await pool.query("DELETE FROM subjects WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
