import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import type { Student } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import PageLayout from '../components/layout/PageLayout';
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
  const [localError, setLocalError] = useState('');

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
    setLocalError('');
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
    setLocalError('');
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
        setLocalError(
          err.message || `Failed to ${isEditing ? 'update' : 'add'} student`
        );
      }
    } else {
      setLocalError('Please fill all fields');
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
    <PageLayout
      title="Student Management"
      subtitle="Manage your students and their class assignments"
      actions={
        <Button
          onClick={handleAddStudentClick}
          leftIcon={<PlusCircleIcon className="h-4 w-4" />}
        >
          Add Student
        </Button>
      }
    >
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <Input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-80"
          />
        </div>
      </div>

      {filteredStudents.length > 0 ? (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Student Name</Table.HeaderCell>
              <Table.HeaderCell>Roll Number</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Classes</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {filteredStudents.map(student => {
              // Get class names for the student
              const studentClasses = classes.filter(c =>
                student.classIds?.includes(c.id)
              );
              const classNames =
                studentClasses.map(c => c.name).join(', ') || 'N/A';

              return (
                <Table.Row key={student.id}>
                  <Table.Cell className="font-medium text-gray-900">
                    {student.name}
                  </Table.Cell>
                  <Table.Cell>{student.rollNumber}</Table.Cell>
                  <Table.Cell>{student.email}</Table.Cell>
                  <Table.Cell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {classNames}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStudentClick(student)}
                      leftIcon={<EditIcon className="h-4 w-4" />}
                    >
                      Edit
                    </Button>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      ) : (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No students found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'No students match your search.'
              : 'Get started by adding a new student.'}
          </p>
          <div className="mt-6">
            <Button
              onClick={handleAddStudentClick}
              leftIcon={<PlusCircleIcon className="h-4 w-4" />}
            >
              Add Student
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Student' : 'Add New Student'}
        size="md"
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="space-y-4">
            {localError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{localError}</div>
              </div>
            )}
            <div>
              <Input
                label="Full Name"
                name="name"
                type="text"
                value={studentForm.name}
                onChange={handleInputChange}
                required
                placeholder="Enter student name"
                autoFocus
              />
            </div>
            <div>
              <Input
                label="Roll Number"
                name="rollNumber"
                type="text"
                value={studentForm.rollNumber}
                onChange={handleInputChange}
                required
                placeholder="Enter roll number"
              />
            </div>
            <div>
              <Input
                label="Email"
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
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
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
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 border border-gray-200">
          <div className="px-2 py-1">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-2 py-1 border border-gray-300 rounded"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onClick={e => e.stopPropagation()}
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
          <div className="px-4 py-2 text-sm text-gray-500 border-t border-gray-200">
            {selectedValues.length} selected
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
