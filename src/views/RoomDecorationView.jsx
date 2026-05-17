import React, { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { SHOP_ITEMS } from '../constants/items';
import { motion } from 'framer-motion';
import { X, Box, RotateCw } from 'lucide-react'; // 🚀 회전 아이콘(RotateCw) 추가

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
      x: 250,
      y: 350,
      rotation: 0 // 🚀 새 가구 배치 시 기본 회전 각도(0도) 추가
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

  // 🚀 가구 회전 기능 추가 (90도씩 회전)
  const handleRotateFurniture = async (instanceId) => {
    const newLayout = layout.map(item => {
      if (item.instanceId === instanceId) {
        // 기존에 회전값이 없으면 0으로 간주하고 90도를 더해줍니다.
        return { ...item, rotation: (item.rotation || 0) + 90 };
      }
      return item;
    });
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
    <div className="h-full flex flex-col relative bg-[#F3F0E9] rounded-2xl overflow-hidden">
      
      <div className="flex-1 flex items-center justify-center relative p-4 overflow-hidden">
        
        {/* 방 전체 영역 (600x600 컨테이너) */}
        <div ref={roomRef} className="relative w-full max-w-[600px] aspect-square flex items-center justify-center">
          
          {/* 3D 디오라마 입체 방 SVG 렌더링 */}
          <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full drop-shadow-[0_25px_35px_rgba(0,0,0,0.15)] pointer-events-none">
            <polygon points="100,180 300,80 300,340 100,440" fill="#5E9F69" />
            <polygon points="300,80 500,180 500,440 300,340" fill="#6FAC7A" />
            <polygon points="100,440 300,340 500,440 300,540" fill="#CD9158" />
            <polygon points="100,425 300,325 300,340 100,440" fill="#936237" />
            <polygon points="300,325 500,425 500,440 300,340" fill="#7A4E29" />
            <polygon points="100,180 300,80 300,60 80,170" fill="#91C39A" />
            <polygon points="300,80 500,180 520,170 300,60" fill="#A5D4AE" />
            <polygon points="80,170 100,180 100,460 80,450" fill="#40764A" />
            <polygon points="500,180 520,170 520,450 500,460" fill="#4B8455" />
            <polygon points="100,440 300,540 300,560 100,460" fill="#8B5B30" />
            <polygon points="300,540 500,440 500,460 300,560" fill="#6D4522" />
            <polyline points="300,80 300,340" stroke="#4A8A55" strokeWidth="2" fill="none" />
            <polyline points="100,440 300,340 500,440" stroke="#A86F3E" strokeWidth="2" fill="none" />
          </svg>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-2xl pointer-events-none border-2 border-white/10">
            {dbUser.name}님의 스페이스
          </div>

          {layout.map(item => {
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
                  
                  {/* 🚀 가구 아이콘 (회전 스타일 적용!) */}
                  <div 
                    className="text-[6rem] leading-none drop-shadow-md transition-all duration-300 group-hover:scale-105 group-active:scale-95 group-active:-translate-y-2"
                    style={{ transform: `rotate(${item.rotation || 0}deg)` }}
                  >
                    {displayIcon}
                  </div>

                  {/* 🚀 조작 버튼 그룹 (회전 + 삭제) */}
                  <div className="absolute -top-4 -right-4 flex space-x-1.5 opacity-0 group-focus-within:opacity-100 transition-opacity z-20">
                    {/* 회전 버튼 */}
                    <button 
                      onClick={() => handleRotateFurniture(item.instanceId)} 
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2.5 shadow-lg transition active:scale-90"
                    >
                      <RotateCw size={16} strokeWidth={3} />
                    </button>
                    {/* 삭제 버튼 */}
                    <button 
                      onClick={() => handleRemoveFurniture(item.instanceId)} 
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2.5 shadow-lg transition active:scale-90"
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {layout.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-60">
              <Box size={40} className="text-gray-800 mb-2 drop-shadow" />
              <p className="font-black text-gray-800 drop-shadow-md text-lg">하단에서 가구를 꺼내 방을 꾸며보세요!</p>
            </div>
          )}
        </div>
      </div>

      {/* 📦 하단 인벤토리 영역 */}
      <div className="h-44 bg-white/70 backdrop-blur-xl border-t border-white/50 rounded-t-[2rem] p-5 flex items-center space-x-4 overflow-x-auto shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
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
                  ? 'border-transparent hover:border-blue-400 hover:shadow-lg cursor-pointer hover:-translate-y-2' 
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