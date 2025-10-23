"use server";

import { sql } from "./neondb";
import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Hash password using SHA-256
 */
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Generate session ID
 */
function generateSessionId() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Register a new user
 */
export async function registerUser(userData) {
  try {
    const { full_name, reg_number, email, password, role } = userData;

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} OR reg_number = ${reg_number}
    `;

    if (existingUser.length > 0) {
      return { 
        success: false, 
        error: "User with this email or registration number already exists" 
      };
    }

    // Hash the password
    const hashedPassword = hashPassword(password);

    // Insert new user
    const result = await sql`
      INSERT INTO users (full_name, reg_number, email, password, role)
      VALUES (${full_name}, ${reg_number}, ${email}, ${hashedPassword}, ${role})
      RETURNING id, full_name, reg_number, email, role
    `;

    return { 
      success: true, 
      data: result[0],
      message: "User registered successfully" 
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  try {
    // Hash the password
    const hashedPassword = hashPassword(password);

    // Find user
    const users = await sql`
      SELECT id, full_name, reg_number, email, role 
      FROM users 
      WHERE email = ${email} AND password = ${hashedPassword}
    `;

    if (users.length === 0) {
      return { success: false, error: "Invalid email or password" };
    }

    const user = users[0];

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await sql`
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES (${sessionId}, ${user.id}, ${expiresAt})
    `;

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });

    return { 
      success: true, 
      data: user,
      message: "Login successful" 
    };
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      return { success: false, error: "No active session" };
    }

    // Check if session exists and is valid
    const sessions = await sql`
      SELECT s.user_id, s.expires_at, u.id, u.full_name, u.reg_number, u.email, u.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ${sessionId} AND s.expires_at > NOW()
    `;

    if (sessions.length === 0) {
      // Delete invalid session cookie
      cookieStore.delete("session");
      return { success: false, error: "Session expired or invalid" };
    }

    const session = sessions[0];
    
    return { 
      success: true, 
      data: {
        id: session.id,
        full_name: session.full_name,
        reg_number: session.reg_number,
        email: session.email,
        role: session.role
      }
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Logout user
 */
export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (sessionId) {
      // Delete session from database
      await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
    }

    // Delete cookie
    cookieStore.delete("session");

    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Clean up expired sessions (can be run periodically)
 */
export async function cleanupExpiredSessions() {
  try {
    await sql`DELETE FROM sessions WHERE expires_at < NOW()`;
    return { success: true, message: "Expired sessions cleaned up" };
  } catch (error) {
    console.error("Error cleaning up sessions:", error);
    return { success: false, error: error.message };
  }
}
