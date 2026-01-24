
export type Grade = '11' | '12';
export type Strand = 'STEM' | 'ABM' | 'HUMMS' | 'GAS' | 'ICT';

export interface Student {
  id: string;
  name: string;
  email: string;
  password: string;
  grade: Grade;
  strand: Strand;
  section: string;
  studentNo: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  password: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  teacherId: string; // Tracks which teacher scanned the student
  timestamp: string; // HH:MM:SS
  date: string; // YYYY-MM-DD
  month: string; // January, February, etc.
}

export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}
