import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function ClosetView({ dbUser }) {
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
