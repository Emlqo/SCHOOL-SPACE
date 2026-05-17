import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function ClosetView({ dbUser }) {
  // 기존 코드의 데이터 관리 로직을 그대로 승계합니다.
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
    <div className="h-full bg-slate-50 flex overflow-hidden">
      {/* 👤 왼쪽: 레퍼런스 스타일 아바타 미리보기 영역 */}
      <div className="w-1/3 bg-white flex flex-col items-center justify-center border-r border-gray-200 p-6 shadow-sm z-10">
        <h2 className="text-xl font-black text-gray-800 mb-8 tracking-tight">마이 아바타</h2>
        
  {/* 캐릭터 합성 도화지 (수정된 부분) */}
        <div className="relative w-56 h-56 bg-pink-50 rounded-full border-4 border-white shadow-lg flex flex-col items-center justify-center overflow-hidden pt-4">
          {/* 착용 헤어 (얼굴 역할) */}
          <div className="text-[100px] z-20 leading-none drop-shadow-md">
            {equipped.hair ? equipped.hair.icon : '🧑'}
          </div>
          {/* 착용 옷 (몸통 역할, 위로 살짝 당겨서 목을 연결) */}
          <div className="text-[90px] z-10 -mt-4 leading-none">
            {equipped.clothes ? equipped.clothes.icon : '👕'}
          </div>
        </div>

        <button 
          onClick={handleSave} 
          className="mt-10 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 w-full rounded-2xl shadow-md transition active:scale-95 text-lg"
        >
          저장하고 나가기
        </button>
      </div>

      {/* 🛍️ 오른쪽: 인벤토리 아이템 그리드 영역 */}
      <div className="flex-1 p-8 flex flex-col bg-slate-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">보유한 아이템</h2>
        
        {/* 카테고리 탭 (Hair / Clothes) */}
        <div className="flex space-x-6 border-b border-gray-200 mb-6 shrink-0">
          {['hair', 'clothes'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`pb-3 px-2 text-base font-black transition ${
                activeTab === tab 
                  ? 'border-b-4 border-pink-500 text-gray-800' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'hair' ? '헤어스타일' : '옷/의상'}
            </button>
          ))}
        </div>

        {/* 아이템 갤러리 */}
        <div className="flex-1 overflow-y-auto grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 content-start pr-2">
          {myItems.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-300">
              <span className="text-4xl mb-3">🛒</span>
              <p className="text-gray-400 font-bold text-center">아직 보유한 아이템이 없어요.<br/>광장의 상점에서 구매해보세요!</p>
            </div>
          ) : (
            myItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => setEquipped({ ...equipped, [activeTab]: item })} 
                className={`cursor-pointer rounded-2xl p-4 flex flex-col items-center justify-center transition border-4 relative h-32 bg-white shadow-sm hover:shadow-md ${
                  equipped[activeTab]?.id === item.id 
                    ? 'border-pink-400 bg-pink-50/50' 
                    : 'border-transparent hover:border-gray-200'
                }`}
              >
                {equipped[activeTab]?.id === item.id && (
                  <div className="absolute top-2 right-2 bg-pink-500 w-3 h-3 rounded-full border-2 border-white"></div>
                )}
                <span className="text-5xl mb-2 transition-transform hover:scale-110">{item.icon}</span>
                <span className="text-xs font-bold text-gray-600 text-center leading-tight line-clamp-1">{item.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}