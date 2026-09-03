// Service layer for subject resource
import * as repo from "../repositories/subject-repository.js";
export function getAllSubjects() {
  return repo.findAll();
}

export function getSubjectById(id) {
  return repo.findById(id);
}

export function createNewSubject(subject) {
  return repo.create(subject);
}

export function updateSubjectById(id, subject) {
  const newSubject = repo.updateSubject(id, subject);
  if (newSubject == null) return false;
  return newSubject;
}

export function removeSubjectById(id) {
  return repo.remove(id);
}
