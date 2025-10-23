"use server";

import { neon } from "@neondatabase/serverless";

// Initialize Neon client with connection pooling
const sql = neon(process.env.DATABASE_URL);

// Export the sql client for usage in other modules
export { sql };
