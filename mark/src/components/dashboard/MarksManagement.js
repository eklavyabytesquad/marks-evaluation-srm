'use client';

import { useState, useEffect } from 'react';
import { 
  getAllMarks,
  getMarksByTest,
  upsertStudentMarks,
  bulkUpsertMarks,
  deleteStudentMarks
} from '@/app/utils/marks';
import { getAllTests } from '@/app/utils/tests';
import { getAllStudents } from '@/app/utils/students';
import { generateMarksReportPDF } from './MarksReportPDF';

// Helper function to calculate converted marks on client side
function calculateConvertedMarks(marksObtained, maxMarks, convertedMaxMarks) {
  if (maxMarks === 0) return 0;
  return parseFloat(((marksObtained / maxMarks) * convertedMaxMarks).toFixed(2));
}

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

export default function MarksManagement({ userId }) {
  const [marks, setMarks] = useState([]);
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [bulkMarks, setBulkMarks] = useState([]);
  const [filterTestId, setFilterTestId] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (filterTestId) {
      filterMarksByTest();
    } else {
      loadMarks();
    }
  }, [filterTestId]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadMarks(), loadTests(), loadStudents()]);
    setLoading(false);
  };

  const loadMarks = async () => {
    const result = await getAllMarks();
    if (result.success) {
      setMarks(result.data);
    }
  };

  const loadTests = async () => {
    const result = await getAllTests();
    if (result.success) {
      setTests(result.data);
    }
  };

  const loadStudents = async () => {
    const result = await getAllStudents();
    if (result.success) {
      setStudents(result.data);
    }
  };

  const filterMarksByTest = async () => {
    if (!filterTestId) return;
    const result = await getMarksByTest(filterTestId);
    if (result.success) {
      setMarks(result.data);
    }
  };

  const openBulkEntry = (test) => {
    setSelectedTest(test);
    // Initialize bulk marks array with all students
    const initialMarks = students.map(student => ({
      student_id: student.id,
      student_name: student.student_name,
      student_roll_no: student.student_roll_no,
      marks_obtained: '',
      converted_marks: '',
      remarks: ''
    }));
    setBulkMarks(initialMarks);
    setShowBulkModal(true);
  };

  const handleBulkMarksChange = (index, field, value) => {
    const updated = [...bulkMarks];
    updated[index][field] = value;

    // Auto-calculate converted marks when marks_obtained changes
    if (field === 'marks_obtained' && value && selectedTest) {
      const marksObtained = parseFloat(value);
      if (!isNaN(marksObtained)) {
        const converted = calculateConvertedMarks(
          marksObtained,
          selectedTest.max_marks,
          selectedTest.converted_max_marks
        );
        updated[index].converted_marks = converted;
      }
    }

    setBulkMarks(updated);
  };

  const handleBulkSubmit = async () => {
    setError('');
    setSuccess('');

    // Filter out empty entries
    const validMarks = bulkMarks.filter(m => m.marks_obtained !== '' && m.marks_obtained !== null);

    if (validMarks.length === 0) {
      setError('Please enter marks for at least one student');
      return;
    }

    const result = await bulkUpsertMarks(validMarks, selectedTest.id, userId);

    if (result.success) {
      setSuccess(result.message);
      setShowBulkModal(false);
      setSelectedTest(null);
      setBulkMarks([]);
      loadMarks();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleDelete = async (mark) => {
    if (window.confirm(`Are you sure you want to delete marks for ${mark.student_name}?`)) {
      const result = await deleteStudentMarks(mark.id);
      if (result.success) {
        setSuccess(result.message);
        loadMarks();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    }
  };

  const getTestById = (testId) => {
    return tests.find(t => t.id === testId);
  };

  const handlePrintReport = () => {
    if (!filterTestId) {
      setError('Please select a test to generate report');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!filterClass) {
      setError('Please select a class to generate report');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const testInfo = getTestById(parseInt(filterTestId));
    const filteredMarks = marks.filter(m => {
      const student = students.find(s => s.id === m.student_id);
      return student?.class === filterClass;
    });

    if (filteredMarks.length === 0) {
      setError('No marks found for selected class and test');
      setTimeout(() => setError(''), 3000);
      return;
    }

    generateMarksReportPDF(filteredMarks, filterClass, testInfo);
    setSuccess('PDF report opened in new tab!');
    setTimeout(() => setSuccess(''), 3000);
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

      {/* Test Selection for Bulk Entry */}
      <div className="mb-6 bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Test for Bulk Entry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => openBulkEntry(test)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {test.test_name}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900">{test.subject_name}</h4>
              <p className="text-sm text-gray-500">{test.subject_code}</p>
              <div className="mt-2 text-sm text-gray-600">
                <p>Max Marks: {test.max_marks} → {test.converted_max_marks}</p>
              </div>
              <button
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Enter Marks
              </button>
            </div>
          ))}
        </div>
        {tests.length === 0 && (
          <p className="text-gray-500 text-center py-4">No tests available. Please create tests first.</p>
        )}
      </div>

      {/* Filter and View Marks */}
      <div className="mb-6 bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Test:</label>
            <select
              value={filterTestId}
              onChange={(e) => setFilterTestId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">All Tests</option>
              {tests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.test_name} - {test.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class:</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">All Classes</option>
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrintReport}
            disabled={!filterTestId || !filterClass}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
              filterTestId && filterClass
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Preview PDF Report</span>
          </button>
        </div>

        {filterTestId && filterClass && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              �️ Click "Preview PDF Report" to open the report in a new tab. You can download it from there if needed. Report includes marks table, statistics, and performance charts for <strong>{filterClass}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Marks Table */}
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
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks Obtained
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Converted Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    Loading marks...
                  </td>
                </tr>
              ) : marks.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    {filterTestId || filterClass 
                      ? 'No marks found for selected filters.' 
                      : 'No marks found. Select a test above to enter marks.'}
                  </td>
                </tr>
              ) : (
                marks.map((mark) => (
                  <tr key={mark.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {mark.student_roll_no}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{mark.student_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{mark.class || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{mark.test_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{mark.subject_name}</div>
                      <div className="text-xs text-gray-500">{mark.subject_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {mark.marks_obtained} / {mark.max_marks}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {mark.converted_marks} / {mark.converted_max_marks}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{mark.remarks || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(mark)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Marks"
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

      {/* Bulk Entry Modal */}
      {showBulkModal && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Bulk Marks Entry - {selectedTest.test_name}
              </h2>
              <p className="text-gray-600 mt-1">
                {selectedTest.subject_name} ({selectedTest.subject_code})
              </p>
              <div className="mt-2 flex gap-4 text-sm">
                <span className="text-gray-700">
                  Max Marks: <strong>{selectedTest.max_marks}</strong>
                </span>
                <span className="text-gray-700">
                  Converted Max: <strong>{selectedTest.converted_max_marks}</strong>
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tip:</strong> Converted marks will be automatically calculated as you enter marks obtained.
                  Leave blank for students who were absent.
                </p>
              </div>

              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Roll No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Class
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Marks Obtained (/{selectedTest.max_marks})
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Converted (/{selectedTest.converted_max_marks})
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bulkMarks.map((mark, index) => (
                    <tr key={mark.student_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {mark.student_roll_no}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {mark.student_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                        {students.find(s => s.id === mark.student_id)?.class || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={selectedTest.max_marks}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                          value={mark.marks_obtained}
                          onChange={(e) => handleBulkMarksChange(index, 'marks_obtained', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          disabled
                          className="w-24 px-2 py-1 border border-gray-200 rounded bg-green-50 text-green-700 font-semibold"
                          value={mark.converted_marks}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                          placeholder="Optional"
                          value={mark.remarks}
                          onChange={(e) => handleBulkMarksChange(index, 'remarks', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Entries with marks: <strong>{bulkMarks.filter(m => m.marks_obtained !== '').length}</strong> / {bulkMarks.length}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setSelectedTest(null);
                    setBulkMarks([]);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Save All Marks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
