"use server";

import { sql } from "./neondb";

/**
 * Get all students
 */
export async function getAllStudents() {
  try {
    const data = await sql`
      SELECT s.*, u.full_name as added_by_name
      FROM students s
      LEFT JOIN users u ON s.added_by = u.id
      ORDER BY s.created_at DESC
    `;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching students:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get student by ID
 */
export async function getStudentById(studentId) {
  try {
    const data = await sql`
      SELECT s.*, u.full_name as added_by_name
      FROM students s
      LEFT JOIN users u ON s.added_by = u.id
      WHERE s.id = ${studentId}
    `;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Error fetching student:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create new student
 */
export async function createStudent(studentData) {
  try {
    const { student_name, student_roll_no, email, class: studentClass, added_by } = studentData;
    
    const data = await sql`
      INSERT INTO students (student_name, student_roll_no, email, class, added_by)
      VALUES (${student_name}, ${student_roll_no}, ${email || null}, ${studentClass || null}, ${added_by})
      RETURNING *
    `;
    return { success: true, data: data[0], message: "Student created successfully" };
  } catch (error) {
    console.error("Error creating student:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update student
 */
export async function updateStudent(studentId, studentData) {
  try {
    const { student_name, student_roll_no, email, class: studentClass } = studentData;
    
    const data = await sql`
      UPDATE students
      SET student_name = ${student_name}, 
          student_roll_no = ${student_roll_no}, 
          email = ${email || null},
          class = ${studentClass || null}
      WHERE id = ${studentId}
      RETURNING *
    `;
    return { success: true, data: data[0], message: "Student updated successfully" };
  } catch (error) {
    console.error("Error updating student:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete student
 */
export async function deleteStudent(studentId) {
  try {
    await sql`DELETE FROM students WHERE id = ${studentId}`;
    return { success: true, message: "Student deleted successfully" };
  } catch (error) {
    console.error("Error deleting student:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Search students by name or roll number
 */
export async function searchStudents(searchTerm) {
  try {
    const data = await sql`
      SELECT s.*, u.full_name as added_by_name
      FROM students s
      LEFT JOIN users u ON s.added_by = u.id
      WHERE s.student_name ILIKE ${`%${searchTerm}%`}
         OR s.student_roll_no ILIKE ${`%${searchTerm}%`}
      ORDER BY s.student_name
    `;
    return { success: true, data };
  } catch (error) {
    console.error("Error searching students:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Bulk create students
 */
export async function bulkCreateStudents(studentsArray, added_by) {
  try {
    const results = [];
    const errors = [];

    for (const student of studentsArray) {
      try {
        const data = await sql`
          INSERT INTO students (student_name, student_roll_no, email, class, added_by)
          VALUES (${student.student_name}, ${student.student_roll_no}, ${student.email || null}, ${student.class || null}, ${added_by})
          RETURNING *
        `;
        results.push(data[0]);
      } catch (err) {
        errors.push({ student: student.student_roll_no, error: err.message });
      }
    }

    return { 
      success: true, 
      data: results, 
      errors,
      message: `Successfully added ${results.length} students${errors.length > 0 ? `, ${errors.length} failed` : ''}` 
    };
  } catch (error) {
    console.error("Error bulk creating students:", error);
    return { success: false, error: error.message };
  }
}
