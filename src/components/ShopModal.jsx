import React, { useState } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { SHOP_ITEMS } from '../constants/items';
import { X, Sparkles } from 'lucide-react';

export default function ShopModal({ dbUser, onClose }) {
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
