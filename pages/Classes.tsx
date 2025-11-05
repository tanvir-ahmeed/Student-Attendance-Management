
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { PlusCircleIcon } from '../components/Icons';

const ClassesPage: React.FC = () => {
  const { classes, students, addClass } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const handleAddClass = () => {
    if (newClassName.trim()) {
      addClass({ name: newClassName.trim() });
      setNewClassName('');
      setIsModalOpen(false);
    }
  };

  const getStudentCount = (classId: string) => {
    return students.filter(student => student.classId === classId).length;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Class Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircleIcon className="h-5 w-5" />
            Create Class
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Students</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.map((cls) => (
              <tr key={cls.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStudentCount(cls.id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {/* Action buttons like Edit/Delete could go here */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create a new class">
        <div>
          <label htmlFor="className" className="block text-sm font-medium text-gray-700">Class Name</label>
          <Input 
            id="className"
            type="text" 
            value={newClassName} 
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="e.g., Advanced Calculus"
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddClass}>Create Class</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ClassesPage;
