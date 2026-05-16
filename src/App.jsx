import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './config/firebase';

import RoleSelectionView from './views/RoleSelectionView';
import TeacherLoginView from './views/TeacherLoginView';
import StudentLoginView from './views/StudentLoginView';
import OnboardingForm from './views/OnboardingForm';
import PendingView from './views/PendingView';
import AdminDashboard from './views/AdminDashboard';
import GameView from './views/GameView';

import { Clock } from 'lucide-react';

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleSelection, setRoleSelection] = useState(null); 

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setDbUser({ id: docSnap.id, ...docSnap.data() });
          } else {
            setDbUser(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("유저 정보 로드 실패:", error);
          setLoading(false);
        });
        return () => unsubscribeDoc();
      } else {
        setDbUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    setRoleSelection(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-spin text-orange-500"><Clock size={40} /></div>
      </div>
    );
  }

  // 1. 로그인 전: 역할 선택 뷰
  if (!authUser && !roleSelection) {
    return <RoleSelectionView onSelectRole={setRoleSelection} />;
  }

  // 2. 로그인 전: 선생님 전용 간이 패스워드 입력 뷰
  if (!authUser && roleSelection === 'teacher') {
    return <TeacherLoginView onBack={() => setRoleSelection(null)} />;
  }

  // 3. 로그인 전: 학생 로그인 (Google / 게스트 우회) 뷰
  if (!authUser && roleSelection === 'student') {
    return <StudentLoginView onBack={() => setRoleSelection(null)} />;
  }

  // 4. 로그인 완료 후: 신규 유저 정보 입력(온보딩) 폼
  if (authUser && !dbUser) {
    return <OnboardingForm authUser={authUser} />;
  }

  // 5. 유저 권한 및 상태별 화면 분기 라우팅
  if (dbUser.role === 'teacher') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (dbUser.role === 'student' && dbUser.status === 'pending') {
    return <PendingView onLogout={handleLogout} />;
  }

  if (dbUser.role === 'student' && dbUser.status === 'approved') {
    return <GameView dbUser={dbUser} onLogout={handleLogout} />;
  }

  return <div>상태 오류가 발생했습니다. 개발자 콘솔을 확인하세요.</div>;
}
