# SRM Marks Evaluator - Database Setup

## Neon Database Configuration

This project uses Neon (Serverless Postgres) as the database.

### Setup Instructions

1. **Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Add your Neon database URL to `.env.local`
   ```bash
   DATABASE_URL='postgresql://your_user:your_password@your-host.neon.tech/your_database?sslmode=require'
   ```

2. **Create Database Schema**
   - Go to your [Neon Console](https://console.neon.tech)
   - Navigate to the SQL Editor
   - Copy and run the SQL from `src/app/utils/db-schema.sql`

3. **Available Database Functions**

   The `neondb.js` file provides the following server-side functions:

   **Students:**
   - `getStudents()` - Get all students
   - `getStudentById(studentId)` - Get student by ID
   - `addStudent(studentData)` - Add new student
   - `updateStudent(studentId, studentData)` - Update student
   - `deleteStudent(studentId)` - Delete student
   - `getStudentMarks(studentId)` - Get all marks for a student

   **Marks/Grades:**
   - `addMarks(marksData)` - Add marks for a student
   - `updateMarks(markId, marksData)` - Update marks

   **Subjects & Exams:**
   - `getSubjects()` - Get all subjects
   - `getExams()` - Get all exams

   **Statistics:**
   - `getClassStatistics(classId)` - Get class statistics

   **Authentication:**
   - `getUserByEmail(email)` - Get user by email
   - `createUser(userData)` - Create new user

   **Custom Queries:**
   - `executeQuery(query, params)` - Execute custom SQL queries

4. **Usage Example**

   ```javascript
   // In your page.js or component
   import { getStudents, addStudent } from '@/app/utils/neondb';

   // Get all students
   const result = await getStudents();
   if (result.success) {
     console.log(result.data);
   }

   // Add a new student
   const newStudent = await addStudent({
     name: "John Doe",
     email: "john@example.com",
     roll_number: "2024001",
     class_id: 1
   });
   ```

5. **Security Notes**
   - Never commit `.env.local` to version control
   - The database URL contains sensitive credentials
   - All database functions use server-side execution ("use server")
   - Never expose database credentials to client-side code

6. **Database Schema**

   The schema includes the following tables:
   - `users` - User authentication and roles
   - `classes` - Class information
   - `students` - Student records
   - `subjects` - Subject catalog
   - `exams` - Exam details
   - `marks` - Student marks/grades

## Troubleshooting

- Make sure `.env.local` is in the root directory
- Verify your Neon database URL is correct
- Check that all required tables are created
- Ensure your Neon database is in the active state

## Next Steps

1. Set up authentication (NextAuth.js recommended)
2. Create API routes for database operations
3. Build UI components to display and manage data
4. Implement proper error handling and validation
