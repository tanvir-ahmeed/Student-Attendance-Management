import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { PlusCircleIcon, EditIcon } from '../components/Icons';
import Loading from '../components/ui/Loading';

const ClassesPage: React.FC = () => {
  const {
    classes,
    students,
    addClass,
    updateClass,
    fetchClasses,
    fetchStudents,
    loading,
    error,
  } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [editingClass, setEditingClass] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Log when component mounts
  useEffect(() => {
    console.log('ClassesPage component mounted');
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    console.log('Fetching classes and students data');
    fetchClasses()
      .then(() => console.log('Classes fetched successfully'))
      .catch(err => {
        console.error('Error fetching classes:', err);
        setLocalError('Failed to load classes data');
      });
    fetchStudents()
      .then(() => console.log('Students fetched successfully'))
      .catch(err => {
        console.error('Error fetching students:', err);
        setLocalError('Failed to load students data');
      });
  }, [fetchClasses, fetchStudents]);

  const handleAddClass = async () => {
    if (newClassName.trim()) {
      try {
        console.log('Creating new class:', newClassName);
        await addClass({ name: newClassName.trim() });
        setNewClassName('');
        setIsModalOpen(false);
        setLocalError(null);
        console.log('Class created successfully');
      } catch (err: any) {
        console.error('Error creating class:', err);
        const errorMessage = err.message || 'Failed to create class';
        setLocalError(errorMessage);
        alert(errorMessage);
      }
    }
  };

  const handleEditClass = async () => {
    if (editingClass && editingClass.name.trim() && editingClass.id) {
      try {
        console.log('Updating class:', editingClass);
        await updateClass(editingClass.id, editingClass.name.trim());
        setEditingClass(null);
        setIsEditModalOpen(false);
        setLocalError(null);
        console.log('Class updated successfully');
      } catch (err: any) {
        console.error('Error updating class:', err);
        const errorMessage = err.message || 'Failed to update class';
        setLocalError(errorMessage);
        alert(errorMessage);
      }
    }
  };

  const getStudentCount = (classId: string) => {
    const count = students.filter(
      student => student.classId === classId
    ).length;
    console.log(`Student count for class ${classId}:`, count);
    return count;
  };

  // Log component state for debugging
  useEffect(() => {
    console.log('ClassesPage state updated:', {
      classes,
      students,
      loading,
      error,
    });
  }, [classes, students, loading, error]);

  // Check if component is rendering
  console.log('ClassesPage rendering with state:', {
    classesLength: classes.length,
    studentsLength: students.length,
    loading,
    error,
    localError,
  });

  if (loading && classes.length === 0) {
    console.log('Showing loading state');
    return <Loading message="Loading classes..." />;
  }

  if (error || localError) {
    console.log('Showing error state');
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">
          Error loading classes: {error || localError}
        </div>
        <button
          onClick={() => {
            fetchClasses();
            fetchStudents();
          }}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  console.log('Rendering main classes page content');

  return (
    <div className="py-6 page-transition">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Create Class
        </Button>
      </div>

      {localError && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="text-sm text-red-700">{localError}</div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Class Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Number of Students
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.length > 0 ? (
                classes.map(cls => {
                  console.log('Rendering class:', cls);
                  return (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cls.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getStudentCount(cls.id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingClass({ id: cls.id, name: cls.name });
                            setIsEditModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <EditIcon className="h-5 w-5" />
                        </button>
                        {/* Delete button could go here */}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No classes found. Create your first class to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create a new class"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="className"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Class Name
            </label>
            <Input
              id="className"
              type="text"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              placeholder="e.g., Advanced Calculus"
              className="w-full"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClass}>Create Class</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Class Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit class"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="editClassName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Class Name
            </label>
            <Input
              id="editClassName"
              type="text"
              value={editingClass?.name || ''}
              onChange={e =>
                setEditingClass(prev =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
              placeholder="e.g., Advanced Calculus"
              className="w-full"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditClass}>Update Class</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClassesPage;
