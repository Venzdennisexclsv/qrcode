
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { AttendanceRecord, Grade, Strand, Student } from '../types';
import { GRADES, STRANDS, MONTHS } from '../constants';
// Fixed: UserGroup is not an exported member of lucide-react. Replaced with Users.
import { QrCode, ClipboardList, History, Users, CheckCircle2, Clock, XCircle, Calendar, BarChart3, Camera, StopCircle, UserCheck, ChevronRight, Search } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface TeacherDashboardProps {
  teacherId: string;
  attendance: AttendanceRecord[];
  students: Student[];
  onScan: (studentId: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teacherId, attendance, students, onScan }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'scan' | 'students'>('today');
  const [gradeFilter, setGradeFilter] = useState<Grade | 'All'>('All');
  const [strandFilter, setStrandFilter] = useState<Strand | 'All'>('All');
  const [monthFilter, setMonthFilter] = useState<string | 'All'>(MONTHS[new Date().getMonth()]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isScanning, setIsScanning] = useState(false);
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filterLabel = useMemo(() => {
    if (gradeFilter === 'All' && strandFilter === 'All') return "All Students";
    const gPart = gradeFilter === 'All' ? "" : `Grade ${gradeFilter}`;
    const sPart = strandFilter === 'All' ? "" : strandFilter;
    return [gPart, sPart].filter(Boolean).join(" - ");
  }, [gradeFilter, strandFilter]);

  // Only show students matching filters and search
  const getFilteredStudents = () => {
    return students.filter(s => {
      const gMatch = gradeFilter === 'All' || s.grade === gradeFilter;
      const sMatch = strandFilter === 'All' || s.strand === strandFilter;
      const searchMatch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.studentNo.toLowerCase().includes(searchQuery.toLowerCase());
      return gMatch && sMatch && searchMatch;
    });
  };

  // Only show attendance scanned by THIS teacher
  const filteredTodayAttendance = useMemo(() => {
    const classList = students.filter(s => {
      const gMatch = gradeFilter === 'All' || s.grade === gradeFilter;
      const sMatch = strandFilter === 'All' || s.strand === strandFilter;
      return gMatch && sMatch;
    });
    return attendance.filter(a => {
      if (a.date !== todayStr) return false;
      if (a.teacherId !== teacherId) return false;
      return classList.some(s => s.id === a.studentId);
    });
  }, [attendance, gradeFilter, strandFilter, todayStr, teacherId, students]);

  const stats = useMemo(() => {
    const classList = students.filter(s => {
      const gMatch = gradeFilter === 'All' || s.grade === gradeFilter;
      const sMatch = strandFilter === 'All' || s.strand === strandFilter;
      return gMatch && sMatch;
    });
    const totalExpected = classList.length;
    const presentCount = filteredTodayAttendance.length;
    const absentCount = Math.max(0, totalExpected - presentCount);
    const rate = totalExpected > 0 ? Math.round((presentCount / totalExpected) * 100) : 0;
    
    return { totalExpected, presentCount, absentCount, rate };
  }, [students, filteredTodayAttendance, gradeFilter, strandFilter]);

  const historyList = useMemo(() => {
    const classList = students.filter(s => {
      const gMatch = gradeFilter === 'All' || s.grade === gradeFilter;
      const sMatch = strandFilter === 'All' || s.strand === strandFilter;
      return gMatch && sMatch;
    });
    return attendance.filter(a => {
      if (a.teacherId !== teacherId) return false;
      const monthMatch = monthFilter === 'All' || a.month === monthFilter;
      const isRegistered = classList.some(s => s.id === a.studentId);
      return monthMatch && isRegistered && a.date !== todayStr;
    });
  }, [attendance, gradeFilter, strandFilter, monthFilter, teacherId, todayStr, students]);

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 15, qrbox: 250 }, false);
      scanner.render((text) => {
        const student = students.find(s => s.id === text);
        if (student) {
          setScannedStudent(student);
          scanner.clear().catch(() => {});
          setIsScanning(false);
        } else {
          alert("Invalid Student QR Code");
        }
      }, () => {});
      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(err => console.error(err));
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const confirmAttendance = () => {
    if (scannedStudent) {
      onScan(scannedStudent.id);
      setScannedStudent(null);
      setActiveTab('today');
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) scannerRef.current.clear().catch(() => {});
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 relative">
      {/* Student Info Verification Modal */}
      {scannedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-blue-600 p-8 text-center text-white">
              <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/10">
                <UserCheck size={48} className="text-white" />
              </div>
              <h3 className="text-2xl font-black">Student Scanned!</h3>
              <p className="text-blue-100 font-medium opacity-80 uppercase tracking-widest text-[10px]">Confirm Identity</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="bg-slate-50 p-6 rounded-[24px] space-y-4 border border-slate-100">
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</span>
                  <span className="font-bold text-slate-800">{scannedStudent.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade & Strand</span>
                  <span className="font-bold text-slate-800">{scannedStudent.grade} - {scannedStudent.strand}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section</span>
                  <span className="font-bold text-slate-800">{scannedStudent.section}</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-slate-600 font-bold text-sm">Do you want to record this student as present in your class?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setScannedStudent(null)}
                  className="py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-colors text-xs uppercase tracking-widest"
                >
                  No, Skip
                </button>
                <button 
                  onClick={confirmAttendance}
                  className="py-4 rounded-2xl bg-green-500 text-white font-black hover:bg-green-600 transition-all shadow-lg shadow-green-100 text-xs uppercase tracking-widest"
                >
                  Yes, Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header & Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Teacher Console</h2>
          <p className="text-slate-500 font-medium">Viewing logs for: <span className="text-blue-600 font-bold uppercase">{filterLabel}</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={gradeFilter} onChange={e => setGradeFilter(e.target.value as any)}
            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Grades</option>
            {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <select 
            value={strandFilter} onChange={e => setStrandFilter(e.target.value as any)}
            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Strands</option>
            {STRANDS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-start mb-4">
             <div className="bg-blue-50 p-2 rounded-xl text-blue-600"><Users size={20}/></div>
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Expected</span>
           </div>
           <p className="text-3xl font-black text-slate-800">{stats.totalExpected}</p>
        </div>
        <div className="bg-green-500 p-6 rounded-3xl shadow-md text-white">
           <div className="flex justify-between items-start mb-4">
             <div className="bg-white/20 p-2 rounded-xl text-white"><CheckCircle2 size={20}/></div>
             <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Scanned Today</span>
           </div>
           <p className="text-3xl font-black">{stats.presentCount}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-start mb-4">
             <div className="bg-red-50 p-2 rounded-xl text-red-600"><XCircle size={20}/></div>
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pending</span>
           </div>
           <p className="text-3xl font-black text-slate-800">{stats.absentCount}</p>
        </div>
        <div className="bg-blue-600 p-6 rounded-3xl shadow-md text-white">
           <div className="flex justify-between items-start mb-4">
             <div className="bg-white/20 p-2 rounded-xl text-white"><BarChart3 size={20}/></div>
             <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Efficiency</span>
           </div>
           <p className="text-3xl font-black">{stats.rate}%</p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex gap-2 overflow-x-auto">
        <button onClick={() => setActiveTab('today')} className={`flex-1 min-w-[120px] py-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${activeTab === 'today' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>
          <ClipboardList size={18} /><span className="text-sm font-bold">Today</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 min-w-[120px] py-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>
          <History size={18} /><span className="text-sm font-bold">Records</span>
        </button>
        <button onClick={() => setActiveTab('students')} className={`flex-1 min-w-[120px] py-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${activeTab === 'students' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Users size={18} /><span className="text-sm font-bold">All Students</span>
        </button>
        <button onClick={() => { setActiveTab('scan'); stopScanner(); }} className={`flex-1 min-w-[120px] py-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${activeTab === 'scan' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
          <QrCode size={18} /><span className="text-sm font-bold">Scanner</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        {activeTab === 'scan' ? (
          <div className="p-12 flex flex-col items-center justify-center animate-in fade-in duration-500">
             {!isScanning ? (
                <div className="text-center space-y-6">
                  <div className="bg-slate-50 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto text-slate-300 border border-slate-100">
                    <Camera size={48} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Camera Ready</h3>
                    <p className="text-slate-500 max-w-xs mt-2 mx-auto text-sm font-medium">Click below to start scanning. Your ID will be saved with every scan.</p>
                  </div>
                  <button 
                    onClick={startScanner}
                    className="flex items-center space-x-3 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 mx-auto uppercase tracking-widest text-xs"
                  >
                    <Camera size={20} />
                    <span>Start Scanner</span>
                  </button>
                </div>
             ) : (
                <div className="w-full max-w-sm space-y-6">
                  <div id="reader" className="w-full rounded-3xl overflow-hidden border-8 border-slate-50 shadow-inner bg-slate-100 aspect-square"></div>
                  <button 
                    onClick={stopScanner}
                    className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 px-6 py-4 rounded-2xl font-bold hover:bg-red-100 transition-all border-2 border-red-100 uppercase text-xs tracking-widest"
                  >
                    <StopCircle size={18} />
                    <span>Stop Scanner</span>
                  </button>
                </div>
             )}
          </div>
        ) : activeTab === 'today' ? (
          <div className="divide-y divide-slate-50">
             <div className="p-6 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Attendance Recorded by You</h3>
                <div className="flex items-center text-slate-400 space-x-2 bg-white px-3 py-1 rounded-full border border-slate-100">
                  <Clock size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{new Date().toDateString()}</span>
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50/80">
                   <tr>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredTodayAttendance.map(a => {
                      const s = students.find(std => std.id === a.studentId);
                      return (
                        <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{s?.name}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{s?.studentNo}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-600">{s?.grade} - {s?.section}</td>
                          <td className="px-6 py-4 text-sm font-mono text-slate-500">{a.timestamp}</td>
                          <td className="px-6 py-4"><span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Logged</span></td>
                        </tr>
                      );
                    })}
                    {filteredTodayAttendance.length === 0 && (
                      <tr><td colSpan={4} className="py-24 text-center text-slate-300 italic font-medium">You haven't scanned any students yet today.</td></tr>
                    )}
                 </tbody>
               </table>
             </div>
          </div>
        ) : activeTab === 'history' ? (
          <div className="p-6 space-y-6">
             <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 p-5 rounded-[24px]">
                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-blue-600" />
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Your History</h3>
                </div>
                <select 
                  value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none"
                >
                  <option value="All">All Months</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {historyList.map(a => {
                 const s = students.find(std => std.id === a.studentId);
                 return (
                   <div key={a.id} className="p-5 bg-white border border-slate-100 rounded-[24px] flex items-center space-x-4 hover:shadow-lg transition-all group">
                      <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 font-black text-xl border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {s?.name.charAt(0)}
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{s?.name}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{a.date} &bull; {a.timestamp}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                   </div>
                 );
               })}
               {historyList.length === 0 && (
                 <div className="col-span-full py-24 text-center text-slate-300">
                    <History size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="font-medium italic">No previous records found for your account.</p>
                 </div>
               )}
             </div>
          </div>
        ) : (
          <div className="space-y-0">
             <div className="p-6 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                   {/* Fixed: Replaced invalid UserGroup with Users */}
                   <Users className="text-blue-600" size={20} />
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">All Registered Students</h3>
                </div>
                <div className="relative w-full md:w-64">
                   <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                   <input 
                      type="text" 
                      placeholder="Search name or ID..."
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50/80">
                   <tr>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Strand</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Section</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {getFilteredStudents().map(s => {
                      const totalScannedByYou = attendance.filter(a => a.studentId === s.id && a.teacherId === teacherId).length;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{s.name}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{s.studentNo}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-600">Grade {s.grade}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-600">{s.strand}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-600">{s.section}</td>
                          <td className="px-6 py-4">
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full border border-blue-100">
                               {totalScannedByYou} Records
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {getFilteredStudents().length === 0 && (
                      <tr><td colSpan={5} className="py-24 text-center text-slate-300 italic font-medium">No students found matching current filters.</td></tr>
                    )}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
