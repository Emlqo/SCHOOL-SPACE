import React from 'react';
import { School, Users } from 'lucide-react';

export default function RoleSelectionView({ onSelectRole }) {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-2xl w-full text-center border-4 border-orange-100">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">방 꾸미기 교실에 오신 것을 환영합니다!</h1>
        <div className="grid grid-cols-2 gap-6">
          <button onClick={() => onSelectRole('student')} className="flex flex-col items-center justify-center p-10 bg-green-50 rounded-2xl border-4 border-green-200 hover:bg-green-100 transition group">
            <School size={80} className="text-green-500 mb-4 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold text-green-800">학생으로 시작하기</span>
          </button>
          <button onClick={() => onSelectRole('teacher')} className="flex flex-col items-center justify-center p-10 bg-indigo-50 rounded-2xl border-4 border-indigo-200 hover:bg-indigo-100 transition group">
            <Users size={80} className="text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold text-indigo-800">선생님으로 시작하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
