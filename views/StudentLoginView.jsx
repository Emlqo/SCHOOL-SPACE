import React from 'react';
import { GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { School } from 'lucide-react';

export default function StudentLoginView({ onBack }) {
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("로그인 에러:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleGuestLogin = async () => {
    try {
      const cred = await signInAnonymously(auth);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: 'guest@test.com',
        school: '테스트 중학교',
        grade: '1',
        classNumber: '1',
        name: `게스트_${Math.floor(Math.random() * 1000)}`,
        role: 'student',
        status: 'approved',
        money: 1000,
        inventory: [],
        roomLayout: [],
        equipped: { hair: null, clothes: null },
        createdAt: Date.now()
      }, { merge: true });
    } catch (error) {
      console.error("게스트 로그인 실패:", error);
      alert("테스트 접속에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 relative">
      <button onClick={onBack} className="absolute top-6 left-6 text-green-600 font-bold flex items-center bg-white px-4 py-2 rounded-xl shadow">← 뒤로 가기</button>
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border-4 border-green-100">
        <School size={60} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-6">학생 로그인</h2>
        <button onClick={handleGoogleLogin} className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-50 transition mb-4">
          <span>Google로 계속하기</span>
        </button>
        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">또는</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
        <button onClick={handleGuestLogin} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition">빠른 테스트 (게스트 시작)</button>
      </div>
    </div>
  );
}
