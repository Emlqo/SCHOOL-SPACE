import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase'; // auth 추가

export default function OnboardingForm({ authUser }) {
  const [formData, setFormData] = useState({ school: '', grade: '', classNumber: '', name: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.school || !formData.grade || !formData.classNumber || !formData.name) {
      alert("모든 정보를 입력해주세요!"); return;
    }
    try {
      setSubmitting(true);
      const userDocRef = doc(db, 'users', authUser.uid);
      await setDoc(userDocRef, {
        uid: authUser.uid,
        email: authUser.email || '익명 계정',
        ...formData,
        role: 'student',
        status: 'pending',
        money: 0,
        inventory: [],
        roomLayout: [],
        equipped: { hair: null, clothes: null },
        createdAt: Date.now()
      });
    } catch (error) {
      alert("신청 중 오류가 발생했습니다.");
      setSubmitting(false);
    }
  };

  // 로그아웃(처음으로 돌아가기) 함수 추가
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border-4 border-blue-100 space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">학생 정보 입력</h2>
        <input type="text" placeholder="학교 이름" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} />
        <div className="flex space-x-4">
          <input type="number" placeholder="학년" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} />
          <input type="number" placeholder="반" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={formData.classNumber} onChange={e => setFormData({...formData, classNumber: e.target.value})} />
        </div>
        <input type="text" placeholder="이름" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        
        <button type="submit" disabled={submitting} className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50">가입 신청하기</button>
        
        {/* 뒤로 가기(로그아웃) 버튼 추가 */}
        <button type="button" onClick={handleLogout} className="w-full mt-4 text-gray-400 hover:text-gray-600 underline text-sm pb-2">
          잘못 들어왔나요? 처음으로 돌아가기
        </button>
      </form>
    </div>
  );
}