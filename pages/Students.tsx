import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import type { Student } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { PlusCircleIcon, EditIcon } from '../components/Icons';
import Loading from '../components/ui/Loading';

const StudentsPage: React.FC = () => {
  const {
    students,
    classes,
    addStudent,
    editStudent,
    fetchStudents,
    fetchClasses,
    loading,
    error,
  } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [studentForm, setStudentForm] = useState<Omit<Student, 'id'>>({
    name: '',
    rollNumber: '',
    email: '',
    classId: '',
    classIds: [],
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [fetchStudents, fetchClasses]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setStudentForm({ ...studentForm, [name]: value });
  };

  // Handle multi-select change
  const handleMultiSelectChange = (selectedClassIds: string[]) => {
    setStudentForm({ ...studentForm, classIds: selectedClassIds });
  };

  // Open modal for adding a new student
  const handleAddStudentClick = () => {
    setIsEditing(false);
    setCurrentStudentId('');
    setStudentForm({
      name: '',
      rollNumber: '',
      email: '',
      classId: '',
      classIds: [],
    });
    setIsModalOpen(true);
  };

  // Open modal for editing a student
  const handleEditStudentClick = (student: Student) => {
    setIsEditing(true);
    setCurrentStudentId(student.id);
    setStudentForm({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      classId: student.classId,
      classIds: student.classIds || (student.classId ? [student.classId] : []),
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (
      studentForm.name &&
      studentForm.rollNumber &&
      studentForm.email &&
      (studentForm.classIds?.length > 0 || studentForm.classId)
    ) {
      try {
        if (isEditing) {
          // Edit existing student
          await editStudent(currentStudentId, studentForm);
        } else {
          // Add new student
          await addStudent(studentForm);
        }
        // Refresh data after successful operation
        await fetchStudents();
        await fetchClasses();
        setIsModalOpen(false);
      } catch (err: any) {
        alert(
          err.message || `Failed to ${isEditing ? 'update' : 'add'} student`
        );
      }
    } else {
      alert('Please fill all fields');
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(
      student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  if (loading && students.length === 0) {
    return <Loading message="Loading students..." />;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">
          Error loading students: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 page-transition">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <Input
              type="search"
              placeholder="Search students..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
          <Button
            onClick={handleAddStudentClick}
            className="w-full md:w-auto flex items-center justify-center"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Roll Number
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Classes
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  // Get class names for the student
                  const studentClasses = classes.filter(c => 
                    student.classIds?.includes(c.id)
                  );
                  const classNames = studentClasses.map(c => c.name).join(', ') || 'N/A';
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {classNames}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleEditStudentClick(student)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <EditIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    {searchTerm
                      ? 'No students found matching your search.'
                      : 'No students found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Student' : 'Add a new student'}
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input
              name="name"
              type="text"
              value={studentForm.name}
              onChange={handleInputChange}
              required
              placeholder="Enter student name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number
            </label>
            <Input
              name="rollNumber"
              type="text"
              value={studentForm.rollNumber}
              onChange={handleInputChange}
              required
              placeholder="Enter roll number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              name="email"
              type="email"
              value={studentForm.email}
              onChange={handleInputChange}
              required
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classes
            </label>
            <MultiSelect
              options={classes.map(c => ({ value: c.id, label: c.name }))}
              selectedValues={studentForm.classIds || []}
              onChange={handleMultiSelectChange}
              placeholder="Select classes"
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {isEditing ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// MultiSelect component for selecting multiple classes
const MultiSelect: React.FC<{
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}> = ({ options, selectedValues, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const selectedLabels = options
    .filter(option => selectedValues.includes(option.value))
    .map(option => option.label)
    .join(', ');

  return (
    <div className="relative">
      <div
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedLabels || <span className="text-gray-400">{placeholder}</span>}
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1">
          <div className="px-2 py-1">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-2 py-1 border border-gray-300 rounded"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.map(option => (
              <div
                key={option.value}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  selectedValues.includes(option.value) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleToggle(option.value)}
              >
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 text-sm text-gray-500 border-t">
            {selectedValues.length} selected
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;