const API_BASE_URL = '/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface Class {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  _id: string;
  classIds?: string[]; // Updated to support many-to-many
  name: string;
  rollNumber: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceRecord {
  _id: string;
  classId: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent';
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceResponse {
  message: string;
  savedRecords: AttendanceRecord[];
  errors: { studentId: string; error: string }[];
}

interface AttendanceSummary {
  studentId: string;
  studentName: string;
  rollNumber: string;
  status: 'present' | 'absent';
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedClasses?: string[];
}

// Auth API
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json() as Promise<AuthResponse>;
};

// Classes API
export const getClasses = async (token: string): Promise<Class[]> => {
  console.log(
    'API: Fetching classes with token:',
    token.substring(0, 20) + '...'
  );
  const response = await fetch(`${API_BASE_URL}/classes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('API: Response status:', response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API: Error response:', errorText);
    throw new Error('Failed to fetch classes: ' + errorText);
  }

  const data = await response.json();
  console.log('API: Received classes data:', data);
  return data as Class[];
};

export const createClass = async (
  token: string,
  className: string
): Promise<Class> => {
  const response = await fetch(`${API_BASE_URL}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: className }),
  });

  if (!response.ok) {
    throw new Error('Failed to create class');
  }

  return response.json() as Promise<Class>;
};

// Add function for updating classes
export const updateClass = async (
  token: string,
  classId: string,
  className: string
): Promise<Class> => {
  const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: className }),
  });

  if (!response.ok) {
    throw new Error('Failed to update class');
  }

  return response.json() as Promise<Class>;
};

// Students API
export const getStudents = async (
  token: string,
  classId?: string
): Promise<Student[]> => {
  let url = `${API_BASE_URL}/students`;
  if (classId) {
    url += `?classId=${classId}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }

  return response.json() as Promise<Student[]>;
};

export const getStudentsByClass = async (
  token: string,
  classId: string
): Promise<Student[]> => {
  const response = await fetch(`${API_BASE_URL}/students/class/${classId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }

  return response.json() as Promise<Student[]>;
};

export const createStudent = async (
  token: string,
  studentData: Omit<Student, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Student> => {
  const response = await fetch(`${API_BASE_URL}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(studentData),
  });

  if (!response.ok) {
    throw new Error('Failed to create student');
  }

  return response.json() as Promise<Student>;
};

// Add this new function for updating students
export const updateStudent = async (
  token: string,
  studentId: string,
  studentData: Omit<Student, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Student> => {
  const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(studentData),
  });

  if (!response.ok) {
    throw new Error('Failed to update student');
  }

  return response.json() as Promise<Student>;
};

// Teacher API
export const getTeachers = async (token: string): Promise<Teacher[]> => {
  const response = await fetch(`${API_BASE_URL}/teachers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch teachers');
  }

  return response.json() as Promise<Teacher[]>;
};

export const createTeacher = async (
  token: string,
  teacherData: { name: string; email: string; password: string }
): Promise<Teacher> => {
  const response = await fetch(`${API_BASE_URL}/teachers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(teacherData),
  });

  if (!response.ok) {
    throw new Error('Failed to create teacher');
  }

  return response.json() as Promise<Teacher>;
};

export const assignClassesToTeacher = async (
  token: string,
  teacherId: string,
  classIds: string[]
): Promise<{ message: string; teacher: Teacher }> => {
  const response = await fetch(
    `${API_BASE_URL}/teachers/${teacherId}/assign-classes`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ classIds }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to assign classes to teacher');
  }

  return response.json() as Promise<{ message: string; teacher: Teacher }>;
};

// Attendance API
export const getAttendanceRecords = async (
  token: string,
  filters?: { classId?: string; studentId?: string; date?: string }
): Promise<AttendanceRecord[]> => {
  let url = `${API_BASE_URL}/attendance`;
  const queryParams = new URLSearchParams();

  if (filters) {
    if (filters.classId) queryParams.append('classId', filters.classId);
    if (filters.studentId) queryParams.append('studentId', filters.studentId);
    if (filters.date) queryParams.append('date', filters.date);
  }

  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch attendance records');
  }

  return response.json() as Promise<AttendanceRecord[]>;
};

export const markAttendance = async (
  token: string,
  classId: string,
  date: string,
  records: { studentId: string; status: 'present' | 'absent' }[]
): Promise<AttendanceResponse> => {
  const response = await fetch(`${API_BASE_URL}/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ classId, date, records }),
  });

  if (!response.ok) {
    throw new Error('Failed to mark attendance');
  }

  return response.json() as Promise<AttendanceResponse>;
};

export const getAttendanceSummary = async (
  token: string,
  classId: string,
  date: string
): Promise<AttendanceSummary[]> => {
  const response = await fetch(
    `${API_BASE_URL}/attendance/summary/${classId}/${date}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch attendance summary');
  }

  return response.json() as Promise<AttendanceSummary[]>;
};
