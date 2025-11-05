
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import type { Student } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { PlusCircleIcon } from '../components/Icons';

const StudentsPage: React.FC = () => {
    const { students, classes, addStudent } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newStudent, setNewStudent] = useState<Omit<Student, 'id'>>({ name: '', rollNumber: '', email: '', classId: '' });

    const handleAddStudent = () => {
        if (newStudent.name && newStudent.rollNumber && newStudent.email && newStudent.classId) {
            addStudent(newStudent);
            setNewStudent({ name: '', rollNumber: '', email: '', classId: '' });
            setIsModalOpen(false);
        } else {
            alert('Please fill all fields');
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
    };

    const filteredStudents = useMemo(() => {
        return students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm]);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
                <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
                     <Input 
                        type="search" 
                        placeholder="Search students..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64"
                    />
                    <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto">
                        <PlusCircleIcon className="h-5 w-5" />
                        Add Student
                    </Button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map((student) => {
                            const studentClass = classes.find(c => c.id === student.classId);
                            return (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{studentClass?.name || 'N/A'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add a new student">
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <Input name="name" type="text" value={newStudent.name} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                        <Input name="rollNumber" type="text" value={newStudent.rollNumber} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <Input name="email" type="email" value={newStudent.email} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Class</label>
                         <select name="classId" value={newStudent.classId} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="">Select a class</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={handleAddStudent}>Add Student</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StudentsPage;
