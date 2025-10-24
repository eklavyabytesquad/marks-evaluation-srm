'use client';

import { useState, useEffect } from 'react';
import { 
  getAllSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject,
  getFacultyBySubject,
  assignFacultyToSubject,
  removeFacultyFromSubject,
  getAllFaculty
} from '@/app/utils/subjects';

export default function SubjectManagement({ userId }) {
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [assignedFaculty, setAssignedFaculty] = useState([]);
  const [formData, setFormData] = useState({
    subject_name: '',
    subject_code: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSubjects();
    loadFaculty();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    const result = await getAllSubjects();
    if (result.success) {
      setSubjects(result.data);
    }
    setLoading(false);
  };

  const loadFaculty = async () => {
    const result = await getAllFaculty();
    if (result.success) {
      setFaculty(result.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let result;
      if (editingSubject) {
        result = await updateSubject(editingSubject.id, formData);
      } else {
        result = await createSubject({ ...formData, created_by: userId });
      }

      if (result.success) {
        setSuccess(result.message);
        setShowModal(false);
        setFormData({ subject_name: '', subject_code: '' });
        setEditingSubject(null);
        loadSubjects();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      subject_name: subject.subject_name,
      subject_code: subject.subject_code
    });
    setShowModal(true);
  };

  const handleDelete = async (subject) => {
    if (window.confirm(`Are you sure you want to delete "${subject.subject_name}"? This action cannot be undone.`)) {
      const result = await deleteSubject(subject.id);
      if (result.success) {
        setSuccess(result.message);
        loadSubjects();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    }
  };

  const openFacultyModal = async (subject) => {
    setSelectedSubject(subject);
    const result = await getFacultyBySubject(subject.id);
    if (result.success) {
      setAssignedFaculty(result.data);
    }
    setShowFacultyModal(true);
  };

  const handleAssignFaculty = async (facultyId) => {
    if (window.confirm('Are you sure you want to assign this faculty to the subject?')) {
      const result = await assignFacultyToSubject(facultyId, selectedSubject.id);
      if (result.success) {
        setSuccess(result.message);
        const updatedFaculty = await getFacultyBySubject(selectedSubject.id);
        if (updatedFaculty.success) {
          setAssignedFaculty(updatedFaculty.data);
        }
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    }
  };

  const handleRemoveFaculty = async (facultyId) => {
    if (window.confirm('Are you sure you want to remove this faculty from the subject?')) {
      const result = await removeFacultyFromSubject(facultyId, selectedSubject.id);
      if (result.success) {
        setSuccess(result.message);
        const updatedFaculty = await getFacultyBySubject(selectedSubject.id);
        if (updatedFaculty.success) {
          setAssignedFaculty(updatedFaculty.data);
        }
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

      {/* Add Subject Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setEditingSubject(null);
            setFormData({ subject_name: '', subject_code: '' });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
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
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Loading subjects...
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No subjects found. Click "Add New Subject" to create one.
                  </td>
                </tr>
              ) : (
                subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {subject.subject_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subject.subject_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{subject.created_by_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(subject.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openFacultyModal(subject)}
                        className="text-purple-600 hover:text-purple-900 mr-4"
                        title="Manage Faculty"
                      >
                        👥 Faculty
                      </button>
                      <button
                        onClick={() => handleEdit(subject)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Edit Subject"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subject)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Subject"
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

      {/* Add/Edit Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="e.g., Data Structures"
                      value={formData.subject_name}
                      onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Code
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="e.g., CS101"
                      value={formData.subject_code}
                      onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    {editingSubject ? 'Update Subject' : 'Create Subject'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingSubject(null);
                      setFormData({ subject_name: '', subject_code: '' });
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

      {/* Faculty Management Modal */}
      {showFacultyModal && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Manage Faculty - {selectedSubject.subject_name}
              </h2>
              <p className="text-gray-600 mb-6">Subject Code: {selectedSubject.subject_code}</p>

              {/* Assigned Faculty */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Assigned Faculty</h3>
                {assignedFaculty.length === 0 ? (
                  <p className="text-gray-500 text-sm">No faculty assigned yet.</p>
                ) : (
                  <div className="space-y-2">
                    {assignedFaculty.map((f) => (
                      <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{f.full_name}</p>
                          <p className="text-sm text-gray-500">{f.email} • Reg: {f.reg_number}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFaculty(f.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Faculty */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Faculty</h3>
                <div className="space-y-2">
                  {faculty
                    .filter(f => !assignedFaculty.some(af => af.id === f.id))
                    .map((f) => (
                      <div key={f.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300">
                        <div>
                          <p className="font-medium text-gray-900">{f.full_name}</p>
                          <p className="text-sm text-gray-500">{f.email} • Reg: {f.reg_number}</p>
                        </div>
                        <button
                          onClick={() => handleAssignFaculty(f.id)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Assign
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowFacultyModal(false);
                    setSelectedSubject(null);
                    setAssignedFaculty([]);
                  }}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
