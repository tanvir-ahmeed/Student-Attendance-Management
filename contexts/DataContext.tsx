import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import * as api from '../utils/api';
import type { Student, Class, AttendanceRecord } from '../types';

interface DataContextType {
  students: Student[];
  classes: Class[];
  attendance: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  token: string | null;
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  editStudent: (
    studentId: string,
    student: Omit<Student, 'id'>
  ) => Promise<void>;
  addClass: (newClass: Omit<Class, 'id'>) => Promise<void>;
  updateClass: (classId: string, className: string) => Promise<void>;
  saveAttendance: (
    classId: string,
    date: string,
    records: { studentId: string; status: 'Present' | 'Absent' }[]
  ) => Promise<void>;
  fetchStudents: (classId?: string) => Promise<void>;
  fetchClasses: () => Promise<void>;
  fetchAttendance: (filters?: {
    classId?: string;
    studentId?: string;
    date?: string;
  }) => Promise<void>;
  fetchAttendanceSummary: (classId: string, date: string) => Promise<any[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('token');
    console.log(
      'DataContext: Initial token from localStorage:',
      storedToken ? storedToken.substring(0, 20) + '...' : null
    );
    return storedToken;
  });
  const [user, setUser] = useState<any>(null);

  // Initialize user from token
  useEffect(() => {
    if (token) {
      console.log('DataContext: Token found, setting user');
      // In a real app, you would decode the token to get user info
      // For now, we'll just set a placeholder
      setUser({ role: 'admin' }); // Assuming admin for now
    } else {
      console.log('DataContext: No token found');
    }
  }, [token]);

  const handleError = (err: any) => {
    const errorMessage = err.message || 'An error occurred';
    setError(errorMessage);
    console.error(errorMessage);
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.login({ email, password });
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setStudents([]);
    setClasses([]);
    setAttendance([]);
    localStorage.removeItem('token');
  }, []);

  const fetchStudents = useCallback(
    async (classId?: string) => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);
        const data = await api.getStudents(token, classId);
        // Convert API response to match existing types
        const convertedData = data.map(s => {
          // Handle classIds - could be array of strings or objects
          let classIds: string[] = [];
          if ((s as any).classIds) {
            if (Array.isArray((s as any).classIds)) {
              classIds = (s as any).classIds.map((cls: any) => {
                if (typeof cls === 'object' && cls._id) {
                  return cls._id;
                } else if (typeof cls === 'object') {
                  return String(cls);
                } else {
                  return String(cls);
                }
              });
            } else if (
              typeof (s as any).classIds === 'object' &&
              (s as any).classIds._id
            ) {
              classIds = [(s as any).classIds._id];
            } else if (typeof (s as any).classIds === 'object') {
              classIds = [String((s as any).classIds)];
            } else if (typeof (s as any).classIds === 'string') {
              classIds = [(s as any).classIds];
            }
          }

          return {
            id: s._id,
            name: s.name,
            rollNumber: s.rollNumber,
            email: s.email,
            classIds: classIds,
            // For backward compatibility, keep the first classId
            classId: classIds.length > 0 ? classIds[0] : '',
          };
        });
        setStudents(convertedData);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const fetchClasses = useCallback(async () => {
    if (!token) {
      console.log('No token available for fetchClasses');
      return;
    }

    try {
      console.log(
        'Fetching classes with token:',
        token.substring(0, 20) + '...'
      );
      setLoading(true);
      setError(null);
      const data = await api.getClasses(token);
      console.log('Received classes data:', data);
      // Convert API response to match existing types
      const convertedData = data.map(c => ({
        id: c._id,
        name: c.name,
      }));
      setClasses(convertedData);
      console.log('Classes set successfully');
    } catch (err: any) {
      console.error('Error fetching classes:', err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchAttendance = useCallback(
    async (filters?: {
      classId?: string;
      studentId?: string;
      date?: string;
    }) => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);
        const data = await api.getAttendanceRecords(token, filters);
        // Convert API response to match existing types
        const convertedData: AttendanceRecord[] = data.map(a => {
          // Handle classId - could be string or object
          let classId = '';
          if (a.classId) {
            if (typeof a.classId === 'object' && (a.classId as any)._id) {
              classId = (a.classId as any)._id;
            } else if (typeof a.classId === 'object') {
              classId = String(a.classId);
            } else if (typeof a.classId === 'string') {
              classId = a.classId;
            }
          }

          // Handle studentId - could be string or object
          let studentId = '';
          if (a.studentId) {
            if (typeof a.studentId === 'object' && (a.studentId as any)._id) {
              studentId = (a.studentId as any)._id;
            } else if (typeof a.studentId === 'object') {
              studentId = String(a.studentId);
            } else if (typeof a.studentId === 'string') {
              studentId = a.studentId;
            }
          }

          return {
            id: a._id,
            date: new Date(a.date).toISOString().split('T')[0],
            classId,
            studentId,
            status:
              a.status === 'present'
                ? 'Present'
                : ('Absent' as 'Present' | 'Absent'),
          };
        });
        setAttendance(convertedData);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const addStudent = useCallback(
    async (student: Omit<Student, 'id'>) => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);
        // Handle both single classId and multiple classIds
        const classIds =
          student.classIds || (student.classId ? [student.classId] : []);

        const data = await api.createStudent(token, {
          classIds,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
        } as any);

        // Convert API response to match existing types
        let classIdsArray: string[] = [];
        if ((data as any).classIds) {
          if (Array.isArray((data as any).classIds)) {
            classIdsArray = (data as any).classIds.map((cls: any) => {
              if (typeof cls === 'object' && cls._id) {
                return cls._id;
              } else if (typeof cls === 'object') {
                return String(cls);
              } else {
                return String(cls);
              }
            });
          } else if (
            typeof (data as any).classIds === 'object' &&
            (data as any).classIds._id
          ) {
            classIdsArray = [(data as any).classIds._id];
          } else if (typeof (data as any).classIds === 'object') {
            classIdsArray = [String((data as any).classIds)];
          } else if (typeof (data as any).classIds === 'string') {
            classIdsArray = [(data as any).classIds];
          }
        }

        const convertedData = {
          id: data._id,
          name: data.name,
          rollNumber: data.rollNumber,
          email: data.email,
          classIds: classIdsArray,
          // For backward compatibility, keep the first classId
          classId: classIdsArray.length > 0 ? classIdsArray[0] : '',
        };

        setStudents(prev => [...prev, convertedData]);
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Add this new function for editing students
  const editStudent = useCallback(
    async (studentId: string, student: Omit<Student, 'id'>) => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);
        // Handle both single classId and multiple classIds
        const classIds =
          student.classIds || (student.classId ? [student.classId] : []);

        const data = await api.updateStudent(token, studentId, {
          classIds,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
        } as any);

        // Convert API response to match existing types
        let classIdsArray: string[] = [];
        if ((data as any).classIds) {
          if (Array.isArray((data as any).classIds)) {
            classIdsArray = (data as any).classIds.map((cls: any) => {
              if (typeof cls === 'object' && cls._id) {
                return cls._id;
              } else if (typeof cls === 'object') {
                return String(cls);
              } else {
                return String(cls);
              }
            });
          } else if (
            typeof (data as any).classIds === 'object' &&
            (data as any).classIds._id
          ) {
            classIdsArray = [(data as any).classIds._id];
          } else if (typeof (data as any).classIds === 'object') {
            classIdsArray = [String((data as any).classIds)];
          } else if (typeof (data as any).classIds === 'string') {
            classIdsArray = [(data as any).classIds];
          }
        }

        const convertedData = {
          id: data._id,
          name: data.name,
          rollNumber: data.rollNumber,
          email: data.email,
          classIds: classIdsArray,
          // For backward compatibility, keep the first classId
          classId: classIdsArray.length > 0 ? classIdsArray[0] : '',
        };

        // Update the student in the state
        setStudents(prev =>
          prev.map(s => (s.id === studentId ? convertedData : s))
        );
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const addClass = useCallback(
    async (newClass: Omit<Class, 'id'>) => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);
        const data = await api.createClass(token, newClass.name);

        // Convert API response to match existing types
        const convertedData = {
          id: data._id,
          name: data.name,
        };

        setClasses(prev => [...prev, convertedData]);
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Add function for updating classes
  const updateClass = useCallback(
    async (classId: string, className: string) => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);
        const data = await api.updateClass(token, classId, className);

        // Convert API response to match existing types
        const convertedData = {
          id: data._id,
          name: data.name,
        };

        // Update the class in the state
        setClasses(prev =>
          prev.map(cls => (cls.id === classId ? convertedData : cls))
        );
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const saveAttendance = useCallback(
    async (
      classId: string,
      date: string,
      records: { studentId: string; status: 'Present' | 'Absent' }[]
    ) => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        // Convert status to match API format
        const convertedRecords: {
          studentId: string;
          status: 'present' | 'absent';
        }[] = records.map(r => ({
          studentId: r.studentId,
          status:
            r.status === 'Present'
              ? 'present'
              : ('absent' as 'present' | 'absent'),
        }));

        const response: api.AttendanceResponse = await api.markAttendance(
          token,
          classId,
          date,
          convertedRecords
        );

        // Convert API response to match existing types
        const convertedData: AttendanceRecord[] = response.savedRecords.map((a: any) => {
          // Handle classId - could be string or object
          let classId = '';
          if (a.classId) {
            if (typeof a.classId === 'object' && (a.classId as any)._id) {
              classId = (a.classId as any)._id;
            } else if (typeof a.classId === 'object') {
              classId = String(a.classId);
            } else if (typeof a.classId === 'string') {
              classId = a.classId;
            }
          }

          // Handle studentId - could be string or object
          let studentId = '';
          if (a.studentId) {
            if (typeof a.studentId === 'object' && (a.studentId as any)._id) {
              studentId = (a.studentId as any)._id;
            } else if (typeof a.studentId === 'object') {
              studentId = String(a.studentId);
            } else if (typeof a.studentId === 'string') {
              studentId = a.studentId;
            }
          }

          return {
            id: a._id,
            date: new Date(a.date).toISOString().split('T')[0],
            classId,
            studentId,
            status:
              a.status === 'present'
                ? 'Present'
                : ('Absent' as 'Present' | 'Absent'),
          };
        });

        // Update attendance state
        setAttendance(prev => {
          // Remove existing records for the same date and class
          const filteredPrev = prev.filter(
            r => !(r.date === date && r.classId === classId)
          );
          return [...filteredPrev, ...convertedData];
        });
        
        // If there were errors, show them
        if (response.errors && response.errors.length > 0) {
          console.warn('Some attendance records had errors:', response.errors);
        }
      } catch (err: any) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const fetchAttendanceSummary = useCallback(
    async (classId: string, date: string) => {
      if (!token) return [];

      try {
        setLoading(true);
        setError(null);
        const data = await api.getAttendanceSummary(token, classId, date);
        return data;
      } catch (err) {
        handleError(err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return (
    <DataContext.Provider
      value={{
        students,
        classes,
        attendance,
        loading,
        error,
        token,
        user,
        login,
        logout,
        addStudent,
        editStudent,
        addClass,
        updateClass,
        saveAttendance,
        fetchStudents,
        fetchClasses,
        fetchAttendance,
        fetchAttendanceSummary,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
