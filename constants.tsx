import { Student, Grade, Strand } from './types';

export const GRADES: Grade[] = ['11', '12'];
export const STRANDS: Strand[] = ['STEM', 'ABM', 'HUMMS', 'GAS', 'ICT'];
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Added missing password property to comply with Student interface
export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Juan Dela Cruz', email: 'juan@gmail.com', password: 'password123', grade: '11', strand: 'STEM', section: 'A', studentNo: '2024-001' },
  { id: 's2', name: 'Maria Santos', email: 'maria@gmail.com', password: 'password123', grade: '12', strand: 'ABM', section: 'B', studentNo: '2024-002' },
  { id: 's3', name: 'Jose Rizal', email: 'jose@gmail.com', password: 'password123', grade: '11', strand: 'HUMMS', section: 'C', studentNo: '2024-003' },
  { id: 's4', name: 'Ana Reyes', email: 'ana@gmail.com', password: 'password123', grade: '12', strand: 'ICT', section: 'D', studentNo: '2024-004' },
];