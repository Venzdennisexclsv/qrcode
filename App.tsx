
import React, { useState, useEffect } from 'react';
import { UserRole, Student, Teacher, AttendanceRecord } from './types';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import RoleSelector from './components/RoleSelector';
import { MOCK_STUDENTS } from './constants';
import { GraduationCap, LogOut, Loader2 } from 'lucide-react';

// Simulated Backend Service - This is where you'd connect to Firebase/Supabase
const BackendAPI = {
  getStudents: (): Student[] => {
    const saved = localStorage.getItem('qr_students_data');
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  },
  getTeachers: (): Teacher[] => {
    const saved = localStorage.getItem('qr_teachers_data');
    return saved ? JSON.parse(saved) : [];
  },
  getAttendance: (): AttendanceRecord[] => {
    const saved = localStorage.getItem('qr_attendance_data');
    return saved ? JSON.parse(saved) : [];
  },
  saveAttendance: (records: AttendanceRecord[]) => {
    localStorage.setItem('qr_attendance_data', JSON.stringify(records));
  },
  saveStudents: (students: Student[]) => {
    localStorage.setItem('qr_students_data', JSON.stringify(students));
  },
  saveTeachers: (teachers: Teacher[]) => {
    localStorage.setItem('qr_teachers_data', JSON.stringify(teachers));
  }
};

const App: React.FC = () => {
  const [isLaunching, setIsLaunching] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<Student | Teacher | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [registeredStudents, setRegisteredStudents] = useState<Student[]>([]);
  const [registeredTeachers, setRegisteredTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLaunching(false), 2000);
    
    setAttendance(BackendAPI.getAttendance());
    setRegisteredStudents(BackendAPI.getStudents());
    setRegisteredTeachers(BackendAPI.getTeachers());

    return () => clearTimeout(timer);
  }, []);

  const handleRegisterStudent = (newStudent: Student) => {
    const updated = [...registeredStudents, newStudent];
    setRegisteredStudents(updated);
    BackendAPI.saveStudents(updated);
    setCurrentUser(newStudent);
    setRole(UserRole.STUDENT);
  };

  const handleRegisterTeacher = (newTeacher: Teacher) => {
    const updated = [...registeredTeachers, newTeacher];
    setRegisteredTeachers(updated);
    BackendAPI.saveTeachers(updated);
    setCurrentUser(newTeacher);
    setRole(UserRole.TEACHER);
  };

  const handleLogin = (email: string, password: string, userRole: UserRole): { success: boolean, message?: string } => {
    if (userRole === UserRole.TEACHER) {
      const teacher = registeredTeachers.find(t => t.email === email);
      if (!teacher) return { success: false, message: "Account not found" };
      if (teacher.password !== password) return { success: false, message: "Wrong password" };
      
      setCurrentUser(teacher);
      setRole(UserRole.TEACHER);
      return { success: true };
    } else {
      const student = registeredStudents.find(s => s.email === email);
      if (!student) return { success: false, message: "Student record not found" };
      if (student.password !== password) return { success: false, message: "Wrong password" };
      
      setCurrentUser(student);
      setRole(UserRole.STUDENT);
      return { success: true };
    }
  };

  const handleMarkAttendance = (studentId: string) => {
    if (!currentUser || role !== UserRole.TEACHER) return;

    const today = new Date().toISOString().split('T')[0];
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
    
    // Check if THIS teacher already scanned THIS student today
    const alreadyPresent = attendance.find(a => 
      a.studentId === studentId && 
      a.date === today && 
      a.teacherId === currentUser.id
    );

    if (alreadyPresent) {
      alert("You have already recorded this student's attendance today.");
      return;
    }

    const newRecord: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      studentId,
      teacherId: currentUser.id, // Linking the record to the logged-in teacher
      timestamp: new Date().toLocaleTimeString(),
      date: today,
      month: month
    };

    const updated = [newRecord, ...attendance];
    setAttendance(updated);
    BackendAPI.saveAttendance(updated);
  };

  if (isLaunching) {
    return (
      <div className="fixed inset-0 bg-blue-600 flex flex-col items-center justify-center text-white z-50 animate-out fade-out duration-1000 delay-1500">
        <div className="animate-bounce mb-4">
          <GraduationCap size={80} />
        </div>
        <h1 className="text-4xl font-black tracking-tighter animate-pulse text-center">QR-ATTEND PRO</h1>
        <p className="mt-2 text-blue-100 font-medium">Smart Attendance System</p>
        <Loader2 className="mt-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">QR-Attend</h1>
          </div>
          {role && (
            <div className="flex items-center space-x-4">
              <span className="hidden md:block text-sm font-medium text-slate-600">
                Welcome, <span className="text-blue-600 font-bold">{currentUser?.name}</span>
              </span>
              <button
                onClick={() => { setRole(null); setCurrentUser(null); }}
                className="flex items-center space-x-2 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg transition-all border border-slate-200"
              >
                <LogOut size={16} />
                <span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {!role ? (
          <RoleSelector 
            onLogin={handleLogin}
            onRegisterStudent={handleRegisterStudent}
            onRegisterTeacher={handleRegisterTeacher}
          />
        ) : role === UserRole.TEACHER ? (
          <TeacherDashboard 
            teacherId={currentUser?.id || ''}
            attendance={attendance} 
            students={registeredStudents}
            onScan={handleMarkAttendance}
          />
        ) : (
          <StudentDashboard student={currentUser as Student} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            Precision Attendance & bull; ClassCheck System & bull; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
