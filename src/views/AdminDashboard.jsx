import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { LogOut, Coins, UserCheck, Users } from 'lucide-react';

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

  const handleApprove = async (id, name) => {
    try {
      await updateDoc(doc(db, 'users', id), { status: 'approved' });
      alert(`✅ ${name} 학생의 가입을 승인했습니다!`);
    } catch (error) {
      console.error(error);
      alert("승인 중 오류가 발생했습니다.");
    }
  };

  // 🚀 비포/애프터 코인 수치를 명확하게 팝업으로 보여주도록 업그레이드
  const handleGiveMoney = async (id, name, currentMoney) => {
    const beforeMoney = Number(currentMoney || 0);
    const addedMoney = Number(rewardAmount);
    const afterMoney = beforeMoney + addedMoney;

    try {
      await updateDoc(doc(db, 'users', id), { money: increment(addedMoney) });
      // 얼럿창에서 전/후 숫자를 시각적으로 매핑해 줍니다.
      alert(`💰 ${name} 학생에게 코인을 성공적으로 지급했습니다!\n\n[기존 코인: 💰 ${beforeMoney}] → [변경 후 코인: 💰 ${afterMoney}]`);
    } catch (error) {
      console.error(error);
      alert("지급 중 오류가 발생했습니다.");
    }
  };

  const pendingList = students.filter(s => s.status === 'pending');
  const approvedList = students.filter(s => s.status === 'approved');

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 상단 헤더 영역 */}
        <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500 p-2 rounded-2xl text-white">
              <Users size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">선생님 대시보드</h1>
          </div>
          <button onClick={onLogout} className="text-gray-400 hover:text-red-500 flex items-center bg-gray-50 px-4 py-2 rounded-xl transition font-medium text-sm">
            <LogOut size={16} className="mr-2" />로그아웃
          </button>
        </header>

        {/* 1. 승인 대기 명단 목록 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <UserCheck size={20} className="mr-2 text-indigo-500" /> 가입 승인 대기 ({pendingList.length}명)
          </h2>
          {pendingList.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6 bg-gray-50 rounded-2xl">현재 대기 중인 학생이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {pendingList.map(s => (
                <div key={s.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="font-semibold text-gray-700">{s.grade}학년 {s.classNumber}반 {s.name}</span>
                  <button onClick={() => handleApprove(s.id, s.name)} className="bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-600 transition">
                    승인하기
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. 학생 관리 명단 목록 (지급 컨트롤러 보강) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Coins size={20} className="mr-2 text-yellow-500" /> 학급 코인 관리 ({approvedList.length}명)
            </h2>
            <div className="flex items-center space-x-3 bg-yellow-50/60 p-2 rounded-2xl border border-yellow-100">
              <span className="text-xs font-bold text-yellow-700 ml-2">지급 금액 설정:</span>
              <input 
                type="number" 
                value={rewardAmount} 
                onChange={e => setRewardAmount(e.target.value)} 
                className="border-2 border-yellow-200 rounded-xl px-3 py-1.5 w-24 text-center font-black text-gray-800 outline-none focus:border-yellow-400 bg-white transition" 
              />
              <span className="font-bold text-sm text-yellow-800 pr-2">코인</span>
            </div>
          </div>
          
          {approvedList.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6 bg-gray-50 rounded-2xl">아직 승인된 학생이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {approvedList.map(s => (
                <div key={s.id} className="flex justify-between items-center p-4 bg-white hover:bg-slate-50/50 rounded-2xl border border-gray-100 transition shadow-sm">
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-gray-800 text-base">{s.grade}학년 {s.classNumber}반 {s.name}</span>
                    
                    {/* 🚀 잔액 인지성 강화를 위해 노란 테두리 배지 스타일로 전면 리디자인 */}
                    <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                      <span className="text-sm">💰</span>
                      <span className="font-black text-amber-700 text-sm min-w-[30px] text-center">
                        {s.money ?? 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* 버튼 클릭 시 실시간 보유 자산(s.money)을 동적으로 전송 */}
                  <button 
                    onClick={() => handleGiveMoney(s.id, s.name, s.money)} 
                    className="bg-amber-400 hover:bg-amber-500 text-amber-950 px-5 py-2.5 rounded-xl text-sm font-black shadow-sm transition active:scale-95"
                  >
                    +{rewardAmount} 코인 지급
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}