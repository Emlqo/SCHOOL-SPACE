import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { LogOut } from 'lucide-react';

export default function AdminDashboard({ onLogout }) {
  const [students, setStudents] = useState([]);
  const [rewardAmount, setRewardAmount] = useState(100);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const studentList = allUsers.filter(u => u.role === 'student').sort((a, b) => b.createdAt - a.createdAt);
      setStudents(studentList);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (id) => updateDoc(doc(db, 'users', id), { status: 'approved' });
  const handleGiveMoney = async (id) => updateDoc(doc(db, 'users', id), { money: increment(Number(rewardAmount)) });

  const pendingList = students.filter(s => s.status === 'pending');
  const approvedList = students.filter(s => s.status === 'approved');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
          <h1 className="text-2xl font-bold">선생님 대시보드</h1>
          <button onClick={onLogout} className="text-gray-500 hover:text-gray-800 flex items-center"><LogOut className="mr-2" />로그아웃</button>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold mb-4">승인 대기 ({pendingList.length}명)</h2>
          {pendingList.map(s => (
            <div key={s.id} className="flex justify-between items-center py-3 border-b">
              <span>{s.grade}학년 {s.classNumber}반 {s.name}</span>
              <button onClick={() => handleApprove(s.id)} className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm">승인</button>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">학생 관리 ({approvedList.length}명)</h2>
            <div className="flex items-center space-x-2">
              <input type="number" value={rewardAmount} onChange={e => setRewardAmount(e.target.value)} className="border rounded px-2 py-1 w-20 text-center" />
              <span>코인</span>
            </div>
          </div>
          {approvedList.map(s => (
            <div key={s.id} className="flex justify-between items-center py-3 border-b">
              <div>
                <span className="font-bold mr-2">{s.grade}학년 {s.classNumber}반 {s.name}</span>
                <span className="text-yellow-600 font-bold text-sm">💰 {s.money || 0}</span>
              </div>
              <button onClick={() => handleGiveMoney(s.id)} className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg text-sm font-bold">+{rewardAmount} 지급</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
