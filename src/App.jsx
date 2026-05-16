import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInAnonymously, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { BookOpen, LogOut, Clock, Users, CheckCircle, Gamepad2, School, X, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// ==========================================
// Vite 환경변수를 활용한 Firebase 초기화
// ==========================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// 더미 데이터 (상점 아이템 목록)
// ==========================================
const SHOP_ITEMS = {
  furniture: [
    { id: 'f_desk_1', name: '나무 책상', price: 100, icon: '🪑', type: 'furniture' },
    { id: 'f_bed_1', name: '포근한 침대', price: 300, icon: '🛌', type: 'furniture' },
    { id: 'f_plant_1', name: '작은 화분', price: 50, icon: '🪴', type: 'furniture' },
    { id: 'f_lamp_1', name: '스탠드 조명', price: 150, icon: '💡', type: 'furniture' },
    { id: 'f_tv_1', name: '벽걸이 TV', price: 500, icon: '📺', type: 'furniture' },
  ],
  hair: [
    { id: 'h_short_1', name: '단정 숏컷', price: 200, icon: '👦', type: 'hair' },
    { id: 'h_long_1', name: '긴 생머리', price: 200, icon: '👩', type: 'hair' },
    { id: 'h_cap_1', name: '야구 모자', price: 150, icon: '🧢', type: 'hair' },
  ],
  clothes: [
    { id: 'c_school_1', name: '춘추 교복', price: 300, icon: '👔', type: 'clothes' },
    { id: 'c_casual_1', name: '편한 후드티', price: 250, icon: '🧥', type: 'clothes' },
    { id: 'c_sport_1', name: '체육복', price: 200, icon: '🎽', type: 'clothes' },
  ]
};

// ==========================================
// 메인 App 컴포넌트
// ==========================================
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
    signOut(auth);
    setRoleSelection(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-spin text-orange-500"><Clock size={40} /></div>
      </div>
    );
  }

  // 1. 역할 선택 화면
  if (!authUser && !roleSelection) {
    return <RoleSelectionView onSelectRole={setRoleSelection} />;
  }

  // 2. 선생님 로그인 뷰
  if (!authUser && roleSelection === 'teacher') {
    return <TeacherLoginView onBack={() => setRoleSelection(null)} />;
  }

  // 3. 학생 로그인 뷰
  if (!authUser && roleSelection === 'student') {
    return <StudentLoginView onBack={() => setRoleSelection(null)} />;
  }

  // 4. 추가 정보 입력 (학생용)
  if (authUser && !dbUser) {
    return <OnboardingForm authUser={authUser} />;
  }

  // 5. 역할에 따른 화면 분기
  if (dbUser.role === 'teacher') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (dbUser.role === 'student' && dbUser.status === 'pending') {
    return <PendingView onLogout={handleLogout} />;
  }

  if (dbUser.role === 'student' && dbUser.status === 'approved') {
    return <GameView dbUser={dbUser} onLogout={handleLogout} />;
  }

  return <div>상태 오류 발생.</div>;
}

// ==========================================
// 뷰 컴포넌트들
// ==========================================

function RoleSelectionView({ onSelectRole }) {
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

function TeacherLoginView({ onBack }) {
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

function StudentLoginView({ onBack }) {
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

function OnboardingForm({ authUser }) {
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
      </form>
    </div>
  );
}

function PendingView({ onLogout }) {
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

// 선생님 관리 대시보드
function AdminDashboard({ onLogout }) {
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

  const handleApprove = async (id) => await updateDoc(doc(db, 'users', id), { status: 'approved' });
  const handleGiveMoney = async (id) => await updateDoc(doc(db, 'users', id), { money: increment(Number(rewardAmount)) });

  const pendingList = students.filter(s => s.status === 'pending');
  const approvedList = students.filter(s => s.status === 'approved');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
          <h1 className="text-2xl font-bold">선생님 대시보드</h1>
          <button onClick={onLogout} className="text-gray-500 hover:text-gray-800 flex items-center"><LogOut className="mr-2" />로그아웃</button>
        </header>

        {/* 승인 대기 목록 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold mb-4">승인 대기 ({pendingList.length}명)</h2>
          {pendingList.map(s => (
            <div key={s.id} className="flex justify-between items-center py-3 border-b">
              <span>{s.grade}학년 {s.classNumber}반 {s.name}</span>
              <button onClick={() => handleApprove(s.id)} className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm">승인</button>
            </div>
          ))}
        </div>

        {/* 승인 완료 학생 관리 */}
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

// 학생 메인 뷰 (방 꾸미기 / 옷장 / 상점)
function GameView({ dbUser, onLogout }) {
  const [currentTab, setCurrentTab] = useState('room');
  const [isShopOpen, setIsShopOpen] = useState(false);

  return (
    <div className="h-screen bg-green-50 flex flex-col p-4 overflow-hidden relative">
      <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">{dbUser.name[0]}</div>
          <div>
            <p className="text-xs text-gray-500">{dbUser.school} {dbUser.grade}-{dbUser.classNumber}</p>
            <h1 className="font-bold text-gray-800">{dbUser.name}의 방</h1>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setCurrentTab('room')} className={`px-4 py-2 rounded-xl font-bold text-sm ${currentTab === 'room' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>내 방</button>
          <button onClick={() => setCurrentTab('closet')} className={`px-4 py-2 rounded-xl font-bold text-sm ${currentTab === 'closet' ? 'bg-pink-500 text-white' : 'bg-gray-100'}`}>옷장</button>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-100 px-3 py-1.5 rounded-xl flex items-center text-sm">
            <span className="text-yellow-600 font-bold mr-1">💰</span><span className="font-bold text-yellow-700">{dbUser.money}</span>
          </div>
          <button onClick={() => setIsShopOpen(true)} className="bg-blue-500 text-white px-3 py-1.5 rounded-xl text-sm font-bold flex items-center hover:bg-blue-600"><Sparkles size={16} className="mr-1"/>상점</button>
          <button onClick={onLogout} className="text-gray-400 hover:text-gray-600"><LogOut size={18} /></button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {currentTab === 'room' && <RoomDecorationView dbUser={dbUser} />}
        {currentTab === 'closet' && <ClosetView dbUser={dbUser} />}
      </div>

      {isShopOpen && <ShopModal dbUser={dbUser} onClose={() => setIsShopOpen(false)} />}
    </div>
  );
}

// 방 꾸미기 (드래그 앤 드롭)
function RoomDecorationView({ dbUser }) {
  const roomRef = useRef(null);
  const [layout, setLayout] = useState(dbUser.roomLayout || []);

  const myFurniture = (dbUser.inventory || []).filter(item => item.type === 'furniture');
  const getAvailableCount = (itemId) => {
    const total = myFurniture.filter(i => i.id === itemId).length;
    const placed = layout.filter(i => i.itemId === itemId).length;
    return total - placed;
  };
  const uniqueFurnitureIds = [...new Set(myFurniture.map(i => i.id))];

  const handleAddFurniture = async (itemId) => {
    if (getAvailableCount(itemId) <= 0) return;
    const itemData = SHOP_ITEMS.furniture.find(i => i.id === itemId);
    const newItem = { instanceId: Date.now().toString(), itemId: itemId, icon: itemData.icon, x: 0, y: 0 };
    const newLayout = [...layout, newItem];
    setLayout(newLayout);
    await updateDoc(doc(db, 'users', dbUser.id || dbUser.uid), { roomLayout: newLayout });
  };

  const handleRemoveFurniture = async (instanceId) => {
    const newLayout = layout.filter(item => item.instanceId !== instanceId);
    setLayout(newLayout);
    await updateDoc(doc(db, 'users', dbUser.id || dbUser.uid), { roomLayout: newLayout });
  };

  const handleDragEnd = async (e, info, instanceId) => {
    const newLayout = layout.map(item => {
      if (item.instanceId === instanceId) {
        return { ...item, x: item.x + info.offset.x, y: item.y + info.offset.y };
      }
      return item;
    });
    setLayout(newLayout);
    await updateDoc(doc(db, 'users', dbUser.id || dbUser.uid), { roomLayout: newLayout });
  };

  return (
    <div className="h-full flex flex-col relative">
      <div ref={roomRef} className="flex-1 bg-white rounded-t-3xl border-4 border-b-0 border-green-200 relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
        {layout.map(item => (
          <motion.div
            key={item.instanceId}
            drag
            dragConstraints={roomRef}
            dragMomentum={false}
            onDragEnd={(e, info) => handleDragEnd(e, info, item.instanceId)}
            initial={{ x: item.x, y: item.y }}
            className="absolute cursor-grab active:cursor-grabbing group"
            style={{ touchAction: 'none' }}
          >
            <div className="text-6xl select-none relative p-2 border-2 border-transparent group-focus-within:border-blue-400 rounded-lg" tabIndex={0}>
              {item.icon}
              <button onClick={() => handleRemoveFurniture(item.instanceId)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-focus-within:opacity-100 z-10">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
        {layout.length === 0 && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 font-bold text-gray-400">하단에서 가구를 클릭해 배치해보세요!</div>}
      </div>

      <div className="h-32 bg-white border-4 border-green-200 rounded-b-3xl p-4 flex items-center space-x-4 overflow-x-auto shrink-0 shadow-inner">
        {uniqueFurnitureIds.length === 0 ? (
           <p className="text-gray-400 text-sm w-full text-center">보유한 가구가 없습니다. 상점을 방문해보세요!</p>
        ) : (
          uniqueFurnitureIds.map(itemId => {
            const itemData = SHOP_ITEMS.furniture.find(i => i.id === itemId);
            const count = getAvailableCount(itemId);
            return (
              <div key={itemId} onClick={() => count > 0 && handleAddFurniture(itemId)} className={`flex-shrink-0 w-24 h-24 border-2 rounded-2xl flex flex-col items-center justify-center relative transition ${count > 0 ? 'border-green-300 bg-green-50 hover:bg-green-100 cursor-pointer' : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'}`}>
                <span className="text-3xl mb-1">{itemData?.icon}</span>
                <span className="text-xs font-bold text-gray-600">{itemData?.name}</span>
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">{count}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// 상점 모달 (구매 로직 포함)
function ShopModal({ dbUser, onClose }) {
  const [activeTab, setActiveTab] = useState('furniture');

  const handlePurchase = async (item) => {
    if (dbUser.money < item.price) {
      alert("코인이 부족합니다! 선생님께 칭찬받아 모아보세요.");
      return;
    }
    const isOneTimeItem = item.type === 'hair' || item.type === 'clothes';
    const alreadyOwned = dbUser.inventory?.some(i => i.id === item.id);
    if (isOneTimeItem && alreadyOwned) {
      alert("이미 보유한 아이템입니다!");
      return;
    }
    try {
      const userRef = doc(db, 'users', dbUser.id || dbUser.uid);
      const newInventory = [...(dbUser.inventory || []), item];
      await updateDoc(userRef, {
        money: increment(-item.price),
        inventory: newInventory
      });
      alert(`[${item.name}] 구매 완료! 🎉`);
    } catch (error) {
      alert("구매에 실패했습니다.");
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-blue-500 p-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center"><Sparkles className="mr-2"/> 아이템 상점</h2>
          <button onClick={onClose} className="text-white hover:bg-blue-600 p-1 rounded-lg"><X size={24} /></button>
        </div>
        <div className="flex bg-gray-50 p-2 shrink-0 space-x-2">
          {['furniture', 'hair', 'clothes'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 rounded-xl font-bold text-sm ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
              {tab === 'furniture' ? '가구' : tab === 'hair' ? '헤어' : '옷'}
            </button>
          ))}
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SHOP_ITEMS[activeTab].map(item => {
              const isOneTime = item.type !== 'furniture';
              const owned = isOneTime && dbUser.inventory?.some(i => i.id === item.id);
              return (
                <div key={item.id} className="border-2 border-gray-100 rounded-2xl p-4 flex flex-col items-center hover:border-blue-300 transition">
                  <span className="text-5xl mb-3">{item.icon}</span>
                  <span className="font-bold text-gray-800 text-sm mb-1">{item.name}</span>
                  <div className="flex items-center text-yellow-600 font-bold text-sm mb-3">💰 {item.price}</div>
                  <button onClick={() => handlePurchase(item)} disabled={owned} className={`w-full py-2 rounded-xl text-sm font-bold transition ${owned ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                    {owned ? '보유 중' : '구매하기'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// 옷장
function ClosetView({ dbUser }) {
  const [equipped, setEquipped] = useState(dbUser.equipped || { hair: null, clothes: null });
  const [activeTab, setActiveTab] = useState('hair');
  const myItems = (dbUser.inventory || []).filter(item => item.type === activeTab);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'users', dbUser.id || dbUser.uid), { equipped });
      alert('성공적으로 저장되었습니다! 🎉');
    } catch (error) {
      alert("저장에 실패했습니다.");
    }
  };

  return (
    <div className="h-full bg-white rounded-2xl shadow-sm border-4 border-pink-100 flex overflow-hidden">
      <div className="w-1/2 bg-pink-50 flex flex-col items-center justify-center border-r border-pink-100 p-4 relative">
        <h2 className="text-lg font-bold text-gray-800 mb-4">나의 캐릭터</h2>
        <div className="relative w-48 h-48 bg-white rounded-3xl shadow-inner border-4 border-gray-200 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center z-10 text-gray-300">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          {equipped.clothes && <div className="absolute inset-0 z-20 flex items-center justify-center text-6xl mt-10">{equipped.clothes.icon}</div>}
          {equipped.hair && <div className="absolute inset-0 z-30 flex items-center justify-center top-[-50px] text-6xl">{equipped.hair.icon}</div>}
        </div>
        <button onClick={handleSave} className="mt-6 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-xl shadow">현재 모습 저장</button>
      </div>
      <div className="w-1/2 p-4 flex flex-col">
        <div className="flex space-x-2 mb-4 shrink-0">
          {['hair', 'clothes'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 rounded-xl text-sm font-bold ${activeTab === tab ? 'bg-pink-100 text-pink-700' : 'bg-gray-50 text-gray-500'}`}>
              {tab === 'hair' ? '내 헤어' : '내 옷'}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 content-start">
          {myItems.length === 0 ? <p className="col-span-2 text-center text-gray-400 mt-4 text-sm">보유한 아이템이 없습니다.</p> : 
            myItems.map(item => (
              <div key={item.id} onClick={() => setEquipped({ ...equipped, [activeTab]: item })} className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center ${equipped[activeTab]?.id === item.id ? 'border-pink-500 bg-pink-50' : 'border-gray-100 hover:border-pink-300'}`}>
                <span className="text-3xl mb-1">{item.icon}</span>
                <span className="text-xs font-bold">{item.name}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
