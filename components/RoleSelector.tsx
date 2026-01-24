
import React, { useState } from 'react';
import { UserRole, Student, Teacher, Grade, Strand } from '../types';
import { STRANDS, GRADES } from '../constants';
import { ShieldCheck, UserCircle, Mail, Lock, UserPlus, ArrowRight, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface RoleSelectorProps {
  onLogin: (email: string, password: string, role: UserRole) => { success: boolean, message?: string };
  onRegisterStudent: (student: Student) => void;
  onRegisterTeacher: (teacher: Teacher) => void;
}

// Sub-components moved outside to prevent focus loss on re-render
const BackButton = ({ onClick, to = 'main' }: { onClick: (to: any) => void, to?: any }) => (
  <button 
    onClick={() => onClick(to)} 
    className="flex items-center text-slate-400 hover:text-blue-600 mb-6 text-sm font-semibold transition-colors group"
  >
    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back
  </button>
);

const LoginForm = ({ 
  role, 
  title, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  showPassword, 
  setShowPassword, 
  error, 
  onSubmit, 
  onBack 
}: any) => (
  <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in zoom-in-95 duration-300">
    <BackButton onClick={onBack} to={role === UserRole.TEACHER ? "teacher_choice" : "student_choice"} />
    <h3 className="text-2xl font-bold text-slate-900 mb-6 uppercase">{title}</h3>
    <form onSubmit={(e) => onSubmit(e, role)} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center space-x-2 text-sm font-bold border border-red-100 animate-in shake duration-300">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      <div className="relative">
        <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
        <input 
          type="email" 
          required 
          placeholder="Gmail Address"
          value={email}
          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-900"
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div className="relative">
        <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
        <input 
          type={showPassword ? "text" : "password"} 
          required 
          placeholder="Password"
          value={password}
          className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-900"
          onChange={e => setPassword(e.target.value)}
        />
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
        Sign In
      </button>
    </form>
  </div>
);

const RoleSelector: React.FC<RoleSelectorProps> = ({ onLogin, onRegisterStudent, onRegisterTeacher }) => {
  const [view, setView] = useState<'main' | 'teacher_choice' | 'teacher_login' | 'teacher_register' | 'student_choice' | 'student_login' | 'student_register'>('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [studentRegData, setStudentRegData] = useState({
    name: '',
    email: '',
    password: '',
    grade: '11' as Grade,
    strand: 'STEM' as Strand,
    section: '',
    studentNo: `ST-${Math.floor(Math.random() * 9000) + 1000}`
  });

  const [teacherRegData, setTeacherRegData] = useState({
    name: '',
    email: '',
    department: '',
    password: ''
  });

  const handleLoginSubmit = (e: React.FormEvent, role: UserRole) => {
    e.preventDefault();
    setError(null);
    const result = onLogin(email, password, role);
    if (!result.success) {
      setError(result.message || "Login failed");
    }
  };

  const handleTeacherRegister = (e: React.FormEvent) => {
    e.preventDefault();
    onRegisterTeacher({
      ...teacherRegData,
      id: Math.random().toString(36).substr(2, 9),
    });
  };

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    onRegisterStudent({
      ...studentRegData,
      id: Math.random().toString(36).substr(2, 9),
    });
  };

  const resetStateAndSetView = (newView: any) => {
    setView(newView);
    setError(null);
    setShowPassword(false);
    setEmail('');
    setPassword('');
  };

  if (view === 'main') {
    return (
      <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">System Portal</h2>
          <p className="mt-2 text-slate-500">Select your account type to proceed</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <button onClick={() => setView('teacher_choice')} className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all text-left">
            <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors mb-6">
              <ShieldCheck className="text-blue-600 group-hover:text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 uppercase">Log in as Teacher</h3>
            <p className="text-slate-500 text-sm mt-1">Manage attendance and classroom logs</p>
          </button>
          <button onClick={() => setView('student_choice')} className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-green-500 hover:shadow-xl hover:-translate-y-1 transition-all text-left">
            <div className="bg-green-50 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-green-600 transition-colors mb-6">
              <UserCircle className="text-green-600 group-hover:text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 uppercase">Log in as Student</h3>
            <p className="text-slate-500 text-sm mt-1">Access your dynamic QR identity</p>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'teacher_choice') {
    return (
      <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-300">
        <BackButton onClick={resetStateAndSetView} />
        <h3 className="text-2xl font-bold text-slate-900 text-center mb-6 uppercase">Teacher Access</h3>
        <button onClick={() => setView('teacher_login')} className="w-full p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-between group hover:border-blue-500 transition-all text-left">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-600 transition-colors">
              <Mail className="text-blue-600 group-hover:text-white" />
            </div>
            <span className="font-bold text-slate-800">Faculty Login</span>
          </div>
          <ArrowRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
        </button>
        <button onClick={() => setView('teacher_register')} className="w-full p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-between group hover:border-indigo-500 transition-all text-left">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-600 transition-colors">
              <UserPlus className="text-indigo-600 group-hover:text-white" />
            </div>
            <span className="font-bold text-slate-800">New Faculty Registration</span>
          </div>
          <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
        </button>
      </div>
    );
  }

  if (view === 'teacher_login') {
    return (
      <LoginForm 
        role={UserRole.TEACHER} 
        title="Teacher Login" 
        email={email} 
        setEmail={setEmail} 
        password={password} 
        setPassword={setPassword} 
        showPassword={showPassword} 
        setShowPassword={setShowPassword} 
        error={error} 
        onSubmit={handleLoginSubmit} 
        onBack={resetStateAndSetView} 
      />
    );
  }

  if (view === 'student_login') {
    return (
      <LoginForm 
        role={UserRole.STUDENT} 
        title="Student Login" 
        email={email} 
        setEmail={setEmail} 
        password={password} 
        setPassword={setPassword} 
        showPassword={showPassword} 
        setShowPassword={setShowPassword} 
        error={error} 
        onSubmit={handleLoginSubmit} 
        onBack={resetStateAndSetView} 
      />
    );
  }

  if (view === 'teacher_register') {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in zoom-in-95 duration-300">
        <BackButton onClick={resetStateAndSetView} to="teacher_choice" />
        <h3 className="text-2xl font-bold text-slate-900 mb-6 uppercase">Faculty Registration</h3>
        <form onSubmit={handleTeacherRegister} className="space-y-4">
          <input 
            type="text" placeholder="Full Name" required 
            value={teacherRegData.name}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900"
            onChange={e => setTeacherRegData({...teacherRegData, name: e.target.value})}
          />
          <input 
            type="email" placeholder="Faculty Gmail" required 
            value={teacherRegData.email}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900"
            onChange={e => setTeacherRegData({...teacherRegData, email: e.target.value})}
          />
          <input 
            type="text" placeholder="Department" required 
            value={teacherRegData.department}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900"
            onChange={e => setTeacherRegData({...teacherRegData, department: e.target.value})}
          />
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} placeholder="Create Password" required 
              value={teacherRegData.password}
              className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900"
              onChange={e => setTeacherRegData({...teacherRegData, password: e.target.value})}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Register Account
          </button>
        </form>
      </div>
    );
  }

  if (view === 'student_choice') {
    return (
      <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-300">
        <BackButton onClick={resetStateAndSetView} />
        <h3 className="text-2xl font-bold text-slate-900 text-center mb-6 uppercase">Student Access</h3>
        <button onClick={() => setView('student_login')} className="w-full p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-between group hover:border-blue-500 transition-all text-left">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-600 transition-colors">
              <Mail className="text-blue-600 group-hover:text-white" />
            </div>
            <span className="font-bold text-slate-800">Student Login</span>
          </div>
          <ArrowRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
        </button>
        <button onClick={() => setView('student_register')} className="w-full p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-between group hover:border-green-500 transition-all text-left">
          <div className="flex items-center space-x-4">
            <div className="bg-green-50 p-3 rounded-xl group-hover:bg-green-600 transition-colors">
              <UserPlus className="text-green-600 group-hover:text-white" />
            </div>
            <span className="font-bold text-slate-800">Student Registration</span>
          </div>
          <ArrowRight className="text-slate-300 group-hover:text-green-500 transition-colors" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in zoom-in-95 duration-300">
      <BackButton onClick={resetStateAndSetView} to="student_choice" />
      <h3 className="text-2xl font-bold text-slate-900 mb-6 uppercase">Student Enrollment</h3>
      <form onSubmit={handleStudentRegister} className="space-y-4">
        <input 
          type="text" placeholder="Full Name" required 
          value={studentRegData.name}
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-slate-900"
          onChange={e => setStudentRegData({...studentRegData, name: e.target.value})}
        />
        <input 
          type="email" placeholder="Gmail Address" required 
          value={studentRegData.email}
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-slate-900"
          onChange={e => setStudentRegData({...studentRegData, email: e.target.value})}
        />
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} placeholder="Create Password" required 
            value={studentRegData.password}
            className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-slate-900"
            onChange={e => setStudentRegData({...studentRegData, password: e.target.value})}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select 
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" 
            value={studentRegData.grade}
            onChange={e => setStudentRegData({...studentRegData, grade: e.target.value as Grade})}
          >
            {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <select 
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" 
            value={studentRegData.strand}
            onChange={e => setStudentRegData({...studentRegData, strand: e.target.value as Strand})}
          >
            {STRANDS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <input 
          type="text" 
          placeholder="Section" 
          required 
          value={studentRegData.section}
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium" 
          onChange={e => setStudentRegData({...studentRegData, section: e.target.value})} 
        />
        <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100">
          Register
        </button>
      </form>
    </div>
  );
};

export default RoleSelector;
