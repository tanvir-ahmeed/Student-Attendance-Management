import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import PageLayout from '../components/layout/PageLayout';
import { PlusCircleIcon, EditIcon, TrashIcon } from '../components/Icons';
import Loading from '../components/ui/Loading';

const ClassesPage: React.FC = () => {
  const { classes, addClass, updateClass, fetchClasses, loading, error } =
    useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClassId, setCurrentClassId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [className, setClassName] = useState('');
  const [localError, setLocalError] = useState('');

  const filteredClasses = useMemo(() => {
    return classes.filter(cls =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [classes, searchTerm]);

  const handleAddClassClick = () => {
    setIsEditing(false);
    setCurrentClassId('');
    setClassName('');
    setLocalError('');
    setIsModalOpen(true);
  };

  const handleEditClassClick = (classId: string, name: string) => {
    setIsEditing(true);
    setCurrentClassId(classId);
    setClassName(name);
    setLocalError('');
    setIsModalOpen(true);
  };

  const handleDeleteClass = async (classId: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        // We would need to implement deleteClass in the DataContext
        // For now, we'll just show an alert
        alert('Delete functionality would be implemented here');
      } catch (err: any) {
        setLocalError(err.message || 'Failed to delete class');
      }
    }
  };

  const handleSubmit = async () => {
    if (!className.trim()) {
      setLocalError('Class name is required');
      return;
    }

    try {
      if (isEditing) {
        await updateClass(currentClassId, className.trim());
      } else {
        await addClass({ name: className.trim() });
      }
      setIsModalOpen(false);
      await fetchClasses();
    } catch (err: any) {
      setLocalError(
        err.message || `Failed to ${isEditing ? 'update' : 'add'} class`
      );
    }
  };

  if (loading && classes.length === 0) {
    return <Loading message="Loading classes..." />;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">
          Error loading classes: {error}
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      title="Class Management"
      subtitle="Manage your classes and student groups"
      actions={
        <Button
          onClick={handleAddClassClick}
          leftIcon={<PlusCircleIcon className="h-4 w-4" />}
        >
          Add Class
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
            placeholder="Search classes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-80"
          />
        </div>
      </div>

      {filteredClasses.length > 0 ? (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Class Name</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {filteredClasses.map(cls => (
              <Table.Row key={cls.id}>
                <Table.Cell className="font-medium text-gray-900">
                  {cls.name}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClassClick(cls.id, cls.name)}
                      leftIcon={<EditIcon className="h-4 w-4" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClass(cls.id)}
                      leftIcon={<TrashIcon className="h-4 w-4" />}
                    >
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No classes found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'No classes match your search.'
              : 'Get started by creating a new class.'}
          </p>
          <div className="mt-6">
            <Button
              onClick={handleAddClassClick}
              leftIcon={<PlusCircleIcon className="h-4 w-4" />}
            >
              Add Class
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Class' : 'Add New Class'}
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
                label="Class Name"
                name="className"
                type="text"
                value={className}
                onChange={e => setClassName(e.target.value)}
                required
                placeholder="Enter class name"
                autoFocus
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Class' : 'Add Class'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
};

export default ClassesPage;
