"use server";

import { sql } from "./neondb";

/**
 * Calculate converted marks (helper function - not exported as server action)
 */
function calculateConvertedMarks(marksObtained, maxMarks, convertedMaxMarks) {
  if (maxMarks === 0) return 0;
  return parseFloat(((marksObtained / maxMarks) * convertedMaxMarks).toFixed(2));
}

/**
 * Get all marks with student and test details
 */
export async function getAllMarks() {
  try {
    const data = await sql`
      SELECT 
        sm.*,
        s.student_name,
        s.student_roll_no,
        s.class,
        t.test_name,
        t.max_marks,
        t.converted_max_marks,
        sub.subject_name,
        sub.subject_code,
        u.full_name as added_by_name
      FROM student_marks sm
      LEFT JOIN students s ON sm.student_id = s.id
      LEFT JOIN tests t ON sm.test_id = t.id
      LEFT JOIN subjects sub ON t.subject_id = sub.id
      LEFT JOIN users u ON sm.added_by = u.id
      ORDER BY sm.created_at DESC
    `;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching marks:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get marks by test
 */
export async function getMarksByTest(testId) {
  try {
    const data = await sql`
      SELECT 
        sm.*,
        s.student_name,
        s.student_roll_no,
        s.class
      FROM student_marks sm
      LEFT JOIN students s ON sm.student_id = s.id
      WHERE sm.test_id = ${testId}
      ORDER BY s.student_roll_no
    `;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching marks by test:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get marks by student
 */
export async function getMarksByStudent(studentId) {
  try {
    const data = await sql`
      SELECT 
        sm.*,
        t.test_name,
        t.max_marks,
        t.converted_max_marks,
        sub.subject_name,
        sub.subject_code
      FROM student_marks sm
      LEFT JOIN tests t ON sm.test_id = t.id
      LEFT JOIN subjects sub ON t.subject_id = sub.id
      WHERE sm.student_id = ${studentId}
      ORDER BY sm.created_at DESC
    `;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching marks by student:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create or update student marks
 */
export async function upsertStudentMarks(marksData) {
  try {
    const { student_id, test_id, marks_obtained, remarks, added_by } = marksData;
    
    // Get test details to calculate converted marks
    const testResult = await sql`
      SELECT max_marks, converted_max_marks FROM tests WHERE id = ${test_id}
    `;
    
    if (testResult.length === 0) {
      return { success: false, error: "Test not found" };
    }
    
    const { max_marks, converted_max_marks } = testResult[0];
    const converted_marks = calculateConvertedMarks(marks_obtained, max_marks, converted_max_marks);
    
    // Upsert (insert or update)
    const data = await sql`
      INSERT INTO student_marks (student_id, test_id, marks_obtained, converted_marks, remarks, added_by, updated_at)
      VALUES (${student_id}, ${test_id}, ${marks_obtained}, ${converted_marks}, ${remarks || null}, ${added_by}, CURRENT_TIMESTAMP)
      ON CONFLICT (student_id, test_id) 
      DO UPDATE SET 
        marks_obtained = ${marks_obtained},
        converted_marks = ${converted_marks},
        remarks = ${remarks || null},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    return { success: true, data: data[0], message: "Marks saved successfully" };
  } catch (error) {
    console.error("Error saving marks:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Bulk upsert student marks
 */
export async function bulkUpsertMarks(marksArray, testId, added_by) {
  try {
    // Get test details
    const testResult = await sql`
      SELECT max_marks, converted_max_marks FROM tests WHERE id = ${testId}
    `;
    
    if (testResult.length === 0) {
      return { success: false, error: "Test not found" };
    }
    
    const { max_marks, converted_max_marks } = testResult[0];
    
    const results = [];
    const errors = [];

    for (const mark of marksArray) {
      try {
        const converted_marks = calculateConvertedMarks(mark.marks_obtained, max_marks, converted_max_marks);
        
        const data = await sql`
          INSERT INTO student_marks (student_id, test_id, marks_obtained, converted_marks, remarks, added_by, updated_at)
          VALUES (${mark.student_id}, ${testId}, ${mark.marks_obtained}, ${converted_marks}, ${mark.remarks || null}, ${added_by}, CURRENT_TIMESTAMP)
          ON CONFLICT (student_id, test_id) 
          DO UPDATE SET 
            marks_obtained = ${mark.marks_obtained},
            converted_marks = ${converted_marks},
            remarks = ${mark.remarks || null},
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;
        results.push(data[0]);
      } catch (err) {
        errors.push({ student_id: mark.student_id, error: err.message });
      }
    }

    return { 
      success: true, 
      data: results, 
      errors,
      message: `Successfully saved marks for ${results.length} students${errors.length > 0 ? `, ${errors.length} failed` : ''}` 
    };
  } catch (error) {
    console.error("Error bulk saving marks:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete student marks
 */
export async function deleteStudentMarks(markId) {
  try {
    await sql`DELETE FROM student_marks WHERE id = ${markId}`;
    return { success: true, message: "Marks deleted successfully" };
  } catch (error) {
    console.error("Error deleting marks:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get students without marks for a specific test
 */
export async function getStudentsWithoutMarks(testId) {
  try {
    const data = await sql`
      SELECT s.*
      FROM students s
      WHERE s.id NOT IN (
        SELECT student_id FROM student_marks WHERE test_id = ${testId}
      )
      ORDER BY s.student_roll_no
    `;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching students without marks:", error);
    return { success: false, error: error.message };
  }
}
