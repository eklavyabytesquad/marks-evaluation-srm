'use client';

import { useState, useEffect } from 'react';
import { 
  getAllStudents, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  searchStudents,
  bulkCreateStudents
} from '@/app/utils/students';

const CLASS_OPTIONS = [
  'CSE A YEAR 1',
  'CSE B YEAR 1',
  'CSE A YEAR 2',
  'CSE B YEAR 2',
  'CSE A YEAR 3',
  'CSE B YEAR 3',
  'CSE A YEAR 4',
  'CSE B YEAR 4'
];

export default function StudentManagement({ userId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [bulkClass, setBulkClass] = useState('');
  const [formData, setFormData] = useState({
    student_name: '',
    student_roll_no: '',
    email: '',
    class: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    const result = await getAllStudents();
    if (result.success) {
      setStudents(result.data);
    }
    setLoading(false);
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      loadStudents();
    } else {
      const result = await searchStudents(term);
      if (result.success) {
        setStudents(result.data);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let result;
      if (editingStudent) {
        result = await updateStudent(editingStudent.id, formData);
      } else {
        result = await createStudent({ ...formData, added_by: userId });
      }

      if (result.success) {
        setSuccess(result.message);
        setShowModal(false);
        setFormData({ student_name: '', student_roll_no: '', email: '' });
        setEditingStudent(null);
        loadStudents();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      student_name: student.student_name,
      student_roll_no: student.student_roll_no,
      email: student.email || '',
      class: student.class || ''
    });
    setShowModal(true);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!bulkClass) {
      setError('Please select a class for bulk import');
      return;
    }

    try {
      // Parse the bulk text - each line should be: Name, Roll Number, Email (optional)
      const lines = bulkText.trim().split('\n').filter(line => line.trim());
      const studentsArray = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          student_name: parts[0],
          student_roll_no: parts[1],
          email: parts[2] || '',
          class: bulkClass
        };
      });

      if (studentsArray.length === 0) {
        setError('No valid student data found');
        return;
      }

      const result = await bulkCreateStudents(studentsArray, userId);

      if (result.success) {
        setSuccess(result.message);
        if (result.errors.length > 0) {
          setError(`Some students failed: ${result.errors.map(e => e.student).join(', ')}`);
        }
        setShowBulkModal(false);
        setBulkText('');
        setBulkClass('');
        loadStudents();
        setTimeout(() => {
          setSuccess('');
          setError('');
        }, 5000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error processing bulk import');
    }
  };

  const handleDelete = async (student) => {
    if (window.confirm(`Are you sure you want to delete student "${student.student_name}"? This action cannot be undone and will remove all associated marks.`)) {
      const result = await deleteStudent(student.id);
      if (result.success) {
        setSuccess(result.message);
        loadStudents();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div>
      {/* Success/Error Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditingStudent(null);
              setFormData({ student_name: '', student_roll_no: '', email: '', class: '' });
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Student</span>
          </button>
          
          <button
            onClick={() => {
              setBulkText('');
              setBulkClass('');
              setShowBulkModal(true);
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Bulk Add</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Loading students...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'No students found matching your search.' : 'No students found. Click "Add Student" to create one.'}
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {student.student_roll_no}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                        {student.class || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.added_by_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(student.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Edit Student"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Student"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="e.g., John Doe"
                      value={formData.student_name}
                      onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="e.g., 2024001"
                      value={formData.student_roll_no}
                      onChange={(e) => setFormData({ ...formData, student_roll_no: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="e.g., student@srm.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    >
                      <option value="">Select Class</option>
                      {CLASS_OPTIONS.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    {editingStudent ? 'Update Student' : 'Create Student'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingStudent(null);
                      setFormData({ student_name: '', student_roll_no: '', email: '', class: '' });
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Students Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bulk Add Students</h2>
              
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">📝 Format Instructions:</p>
                <p className="text-sm text-blue-700">Enter one student per line in the format:</p>
                <code className="block mt-2 p-2 bg-blue-100 rounded text-sm text-gray-900">
                  Student Name, Roll Number, Email (optional)
                </code>
                <p className="text-xs text-blue-600 mt-2">Example:</p>
                <code className="block mt-1 p-2 bg-white rounded text-xs text-gray-900">
                  John Doe, RA2211003010001, john@srm.edu<br/>
                  Jane Smith, RA2211003010002, jane@srm.edu<br/>
                  Mike Johnson, RA2211003010003
                </code>
              </div>
              
              <form onSubmit={handleBulkSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Class for All Students *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      value={bulkClass}
                      onChange={(e) => setBulkClass(e.target.value)}
                    >
                      <option value="">Select Class</option>
                      {CLASS_OPTIONS.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Data (One per line) *
                    </label>
                    <textarea
                      required
                      rows="12"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white font-mono text-sm"
                      placeholder="John Doe, RA2211003010001, john@srm.edu&#10;Jane Smith, RA2211003010002, jane@srm.edu&#10;Mike Johnson, RA2211003010003"
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {bulkText.trim().split('\n').filter(l => l.trim()).length} students will be added
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Add All Students
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkModal(false);
                      setBulkText('');
                      setBulkClass('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
