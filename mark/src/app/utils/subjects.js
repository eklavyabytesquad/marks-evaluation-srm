"use server";

import { sql } from "./neondb";

/**
 * Get all subjects
 */
export async function getAllSubjects() {
  try {
    const data = await sql`
      SELECT s.*, u.full_name as created_by_name
      FROM subjects s
      LEFT JOIN users u ON s.created_by = u.id
      ORDER BY s.created_at DESC
    `;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get subject by ID
 */
export async function getSubjectById(subjectId) {
  try {
    const data = await sql`
      SELECT s.*, u.full_name as created_by_name
      FROM subjects s
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = ${subjectId}
    `;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Error fetching subject:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create new subject
 */
export async function createSubject(subjectData) {
  try {
    const { subject_name, subject_code, created_by } = subjectData;
    
    const data = await sql`
      INSERT INTO subjects (subject_name, subject_code, created_by)
      VALUES (${subject_name}, ${subject_code}, ${created_by})
      RETURNING *
    `;
    return { success: true, data: data[0], message: "Subject created successfully" };
  } catch (error) {
    console.error("Error creating subject:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update subject
 */
export async function updateSubject(subjectId, subjectData) {
  try {
    const { subject_name, subject_code } = subjectData;
    
    const data = await sql`
      UPDATE subjects
      SET subject_name = ${subject_name}, subject_code = ${subject_code}
      WHERE id = ${subjectId}
      RETURNING *
    `;
    return { success: true, data: data[0], message: "Subject updated successfully" };
  } catch (error) {
    console.error("Error updating subject:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete subject
 */
export async function deleteSubject(subjectId) {
  try {
    await sql`DELETE FROM subjects WHERE id = ${subjectId}`;
    return { success: true, message: "Subject deleted successfully" };
  } catch (error) {
    console.error("Error deleting subject:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Assign faculty to subject
 */
export async function assignFacultyToSubject(facultyId, subjectId) {
  try {
    const data = await sql`
      INSERT INTO faculty_subjects (faculty_id, subject_id)
      VALUES (${facultyId}, ${subjectId})
      RETURNING *
    `;
    return { success: true, data: data[0], message: "Faculty assigned successfully" };
  } catch (error) {
    console.error("Error assigning faculty:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove faculty from subject
 */
export async function removeFacultyFromSubject(facultyId, subjectId) {
  try {
    await sql`
      DELETE FROM faculty_subjects 
      WHERE faculty_id = ${facultyId} AND subject_id = ${subjectId}
    `;
    return { success: true, message: "Faculty removed successfully" };
  } catch (error) {
    console.error("Error removing faculty:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get faculty assigned to a subject
 */
export async function getFacultyBySubject(subjectId) {
  try {
    const data = await sql`
      SELECT u.id, u.full_name, u.email, u.reg_number, fs.assigned_at
      FROM faculty_subjects fs
      JOIN users u ON fs.faculty_id = u.id
      WHERE fs.subject_id = ${subjectId}
      ORDER BY fs.assigned_at DESC
    `;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all faculty members
 */
export async function getAllFaculty() {
  try {
    const data = await sql`
      SELECT id, full_name, email, reg_number
      FROM users
      WHERE role = 'faculty'
      ORDER BY full_name
    `;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return { success: false, error: error.message };
  }
}
