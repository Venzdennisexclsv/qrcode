
import React from 'react';
import { Student } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { User, BookOpen, Hash, BadgeCheck } from 'lucide-react';

interface StudentDashboardProps {
  student: Student;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-center text-white">
          <div className="inline-block p-1 rounded-full bg-white/20 mb-4 backdrop-blur-sm">
             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <User size={48} className="text-blue-600" />
             </div>
          </div>
          <h2 className="text-2xl font-bold">{student.name}</h2>
          <p className="text-blue-100 opacity-90">{student.studentNo}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center space-x-3">
              <BookOpen className="text-blue-500" size={20} />
              <div>
                <p className="text-xs text-gray-500 font-medium">Grade & Section</p>
                <p className="font-semibold text-gray-900">{student.grade} - {student.section}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center space-x-3">
              <BadgeCheck className="text-green-500" size={20} />
              <div>
                <p className="text-xs text-gray-500 font-medium">Strand</p>
                <p className="font-semibold text-gray-900">{student.strand}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="p-6 bg-white border-4 border-gray-50 rounded-3xl shadow-inner">
              <QRCodeSVG 
                value={student.id} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-gray-900">Your Attendance QR</h3>
              <p className="text-sm text-gray-500 max-w-xs">Present this code to your teacher to record your attendance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
