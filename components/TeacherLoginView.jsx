import React, { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Users } from 'lucide-react';

export default function TeacherLoginView({ onBack }) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (pwd === '1234') {
      try {
        const cred = await signInAnonymously(auth);
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          role: 'teacher',
          name: '선생님',
          status: 'approved',
          createdAt: Date.now()
        }, { merge: true });
      } catch (err) {
        setError("로그인 중 오류가 발생했습니다.");
      }
    } else {
      setError("비밀번호가 틀렸습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4 relative">
      <button onClick={onBack} className="absolute top-6 left-6 text-indigo-600 font-bold flex items-center bg-white px-4 py-2 rounded-xl shadow">← 뒤로 가기</button>
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-sm w-full text-center border-4 border-indigo-100">
        <Users size={60} className="text-indigo-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-6">선생님 로그인</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="password" placeholder="비밀번호 입력" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" value={pwd} onChange={(e) => setPwd(e.target.value)} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-indigo-500 text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition">로그인</button>
        </form>
      </div>
    </div>
  );
}
