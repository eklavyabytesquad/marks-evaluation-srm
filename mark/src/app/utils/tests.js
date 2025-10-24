"use server";

import { sql } from "./neondb";

/**
 * Get all tests
 */
export async function getAllTests() {
  try {
    const data = await sql`
      SELECT t.*, s.subject_name, s.subject_code, u.full_name as created_by_name
      FROM tests t
      LEFT JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
    `;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching tests:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get test by ID
 */
export async function getTestById(testId) {
  try {
    const data = await sql`
      SELECT t.*, s.subject_name, s.subject_code, u.full_name as created_by_name
      FROM tests t
      LEFT JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ${testId}
    `;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Error fetching test:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get tests by subject
 */
export async function getTestsBySubject(subjectId) {
  try {
    const data = await sql`
      SELECT t.*, u.full_name as created_by_name
      FROM tests t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.subject_id = ${subjectId}
      ORDER BY t.test_date DESC
    `;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching tests:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create new test
 */
export async function createTest(testData) {
  try {
    const { 
      test_name, 
      subject_id, 
      max_marks, 
      converted_max_marks, 
      test_date, 
      created_by 
    } = testData;
    
    const data = await sql`
      INSERT INTO tests (
        test_name, 
        subject_id, 
        max_marks, 
        converted_max_marks, 
        test_date, 
        created_by
      )
      VALUES (
        ${test_name}, 
        ${subject_id}, 
        ${max_marks}, 
        ${converted_max_marks}, 
        ${test_date || null}, 
        ${created_by}
      )
      RETURNING *
    `;
    return { success: true, data: data[0], message: "Test created successfully" };
  } catch (error) {
    console.error("Error creating test:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update test
 */
export async function updateTest(testId, testData) {
  try {
    const { 
      test_name, 
      subject_id, 
      max_marks, 
      converted_max_marks, 
      test_date 
    } = testData;
    
    const data = await sql`
      UPDATE tests
      SET test_name = ${test_name},
          subject_id = ${subject_id},
          max_marks = ${max_marks},
          converted_max_marks = ${converted_max_marks},
          test_date = ${test_date || null}
      WHERE id = ${testId}
      RETURNING *
    `;
    return { success: true, data: data[0], message: "Test updated successfully" };
  } catch (error) {
    console.error("Error updating test:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete test
 */
export async function deleteTest(testId) {
  try {
    await sql`DELETE FROM tests WHERE id = ${testId}`;
    return { success: true, message: "Test deleted successfully" };
  } catch (error) {
    console.error("Error deleting test:", error);
    return { success: false, error: error.message };
  }
}
