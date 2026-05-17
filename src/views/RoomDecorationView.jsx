import React, { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { SHOP_ITEMS } from '../constants/items';
import { motion } from 'framer-motion';
import { X, Box } from 'lucide-react';

export default function RoomDecorationView({ dbUser }) {
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
    const newItem = { 
      instanceId: Date.now().toString(), 
      itemId: itemId, 
      icon: itemData.icon, 
      x: 230, // 🚀 커진 방 크기에 맞춰 중앙 스폰 위치 조정
      y: 350  
    };
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
    <div className="h-full flex flex-col relative bg-[#E4DCCF] rounded-2xl overflow-hidden">
      
      <div className="flex-1 flex items-center justify-center relative p-4 overflow-hidden">
        
        {/* 🚀 방 크기를 최대 600px로 대폭 확장하여 광활한 스페이스 제공 */}
        <div ref={roomRef} className="relative w-full max-w-[600px] aspect-square">
          
          {/* 1.5배 커진 2.5D 아이소메트릭 배경 SVG */}
          <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full drop-shadow-2xl pointer-events-none">
            <polygon points="75,180 300,60 300,330 75,450" fill="#2f7d46" />
            <polygon points="300,60 525,180 525,450 300,330" fill="#388e51" />
            <polygon points="75,450 300,330 525,450 300,570" fill="#8b5a2b" />
            <polygon points="75,435 300,315 300,330 75,450" fill="#5c3a21" />
            <polygon points="300,315 525,435 525,450 300,330" fill="#4a2e1b" />
          </svg>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg pointer-events-none">
            {dbUser.name}님의 스페이스
          </div>

          {layout.map(item => {
            // 🚀 핵심: DB에 '누워있는 사람 침대'가 저장되어 있어도 최신 '빈 침대'로 렌더링 강제 변환
            const latestItemData = SHOP_ITEMS.furniture.find(i => i.id === item.itemId);
            const displayIcon = latestItemData ? latestItemData.icon : item.icon;

            return (
              <motion.div
                key={item.instanceId}
                drag
                dragConstraints={roomRef}
                dragMomentum={false}
                onDragEnd={(e, info) => handleDragEnd(e, info, item.instanceId)}
                initial={{ x: item.x, y: item.y }}
                className="absolute cursor-grab active:cursor-grabbing group z-10"
                style={{ touchAction: 'none' }}
              >
                <div className="relative flex flex-col items-center justify-end p-2" tabIndex={0}>
                  {/* 타원형 그림자 */}
                  <div className="absolute bottom-3 w-20 h-6 bg-black/40 rounded-[50%] blur-[4px] -z-10 group-active:scale-90 transition-transform" />
                  
                  {/* 가구 아이콘 (방이 커진 만큼 text-[6rem]으로 더 큼직하게 렌더링) */}
                  <span className="text-[6rem] leading-none drop-shadow-md filter transition-transform group-hover:scale-105 group-active:scale-95 group-active:-translate-y-2">
                    {displayIcon}
                  </span>

                  <button 
                    onClick={() => handleRemoveFurniture(item.instanceId)} 
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-focus-within:opacity-100 transition shadow-lg z-20"
                  >
                    <X size={18} strokeWidth={3} />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {layout.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-60">
              <Box size={40} className="text-white mb-2 drop-shadow" />
              <p className="font-bold text-white drop-shadow-md text-lg">하단에서 가구를 꺼내 방을 꾸며보세요!</p>
            </div>
          )}
        </div>
      </div>

      {/* 📦 하단 인벤토리 영역 */}
      <div className="h-44 bg-white/60 backdrop-blur-md border-t border-white/40 rounded-t-[2rem] p-5 flex items-center space-x-4 overflow-x-auto shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {uniqueFurnitureIds.length === 0 ? (
           <div className="w-full text-center flex flex-col items-center">
             <span className="text-3xl mb-2">🛒</span>
             <p className="text-gray-500 text-sm font-bold">보유한 가구가 없습니다. 광장 상점을 방문해보세요!</p>
           </div>
        ) : (
          uniqueFurnitureIds.map(itemId => {
            const itemData = SHOP_ITEMS.furniture.find(i => i.id === itemId);
            const count = getAvailableCount(itemId);
            return (
              <div 
                key={itemId} 
                onClick={() => count > 0 && handleAddFurniture(itemId)} 
                className={`flex-shrink-0 w-28 h-32 bg-white border-2 rounded-2xl flex flex-col items-center justify-center relative transition-all shadow-sm ${
                  count > 0 
                  ? 'border-transparent hover:border-blue-400 hover:shadow-md cursor-pointer hover:-translate-y-1' 
                  : 'border-gray-200 opacity-50 cursor-not-allowed grayscale'
                }`}
              >
                <span className="text-5xl mb-2 drop-shadow-sm">{itemData?.icon}</span>
                <span className="text-xs font-extrabold text-gray-700">{itemData?.name}</span>
                
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-black w-8 h-8 rounded-full flex items-center justify-center border-[3px] border-white shadow-sm">
                  {count}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}