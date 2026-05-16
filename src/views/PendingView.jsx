import React from 'react';
import { Clock, LogOut } from 'lucide-react';

export default function PendingView({ onLogout }) {
  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-lg max-w-sm w-full text-center border-4 border-yellow-200">
        <Clock size={60} className="text-yellow-400 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">승인 대기 중</h2>
        <p className="text-gray-600 mb-8">선생님이 확인 중이에요.</p>
        <button onClick={onLogout} className="text-gray-500 text-sm flex items-center justify-center w-full hover:text-gray-800"><LogOut size={16} className="mr-1" />로그아웃</button>
      </div>
    </div>
  );
}
