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

  // 🚀 가구 추가 시 방의 중앙(바닥)에 떨어지도록 기본 좌표 수정
  const handleAddFurniture = async (itemId) => {
    if (getAvailableCount(itemId) <= 0) return;
    const itemData = SHOP_ITEMS.furniture.find(i => i.id === itemId);
    const newItem = { 
      instanceId: Date.now().toString(), 
      itemId: itemId, 
      icon: itemData.icon, 
      x: 150, // 방 중앙 X
      y: 200  // 방 중앙 Y (바닥 쪽)
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
      
      {/* 🏡 본디(Bondee) 스타일 아이소메트릭 방 영역 */}
      <div className="flex-1 flex items-center justify-center relative p-4 overflow-hidden">
        
        {/* 방의 물리적/시각적 바운더리 박스 */}
        <div ref={roomRef} className="relative w-full max-w-[400px] aspect-square">
          
          {/* 🎨 2.5D 룸 배경 렌더링 (SVG를 이용한 정밀한 원근감) */}
          <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full drop-shadow-2xl pointer-events-none">
            {/* 1. 왼쪽 벽 (다크 그린) */}
            <polygon points="50,120 200,40 200,220 50,300" fill="#2f7d46" />
            {/* 2. 오른쪽 벽 (라이트 그린) */}
            <polygon points="200,40 350,120 350,300 200,220" fill="#388e51" />
            {/* 3. 바닥 (나무 마룻바닥 색상) */}
            <polygon points="50,300 200,220 350,300 200,380" fill="#8b5a2b" />
            {/* 4. 왼쪽 걸레받이(몰딩) */}
            <polygon points="50,290 200,210 200,220 50,300" fill="#5c3a21" />
            {/* 5. 오른쪽 걸레받이(몰딩) */}
            <polygon points="200,210 350,290 350,300 200,220" fill="#4a2e1b" />
          </svg>

          {/* 중앙에 유저 이름 명패 추가 */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg pointer-events-none">
            {dbUser.name}님의 스페이스
          </div>

          {/* 🪑 배치된 가구들 (드래그 앤 드롭) */}
          {layout.map(item => (
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
              {/* 아이템 래퍼 (그림자 및 포커스 효과) */}
              <div className="relative flex flex-col items-center justify-end p-2" tabIndex={0}>
                
                {/* 🚀 핵심: 입체감을 주는 타원형 바닥 그림자 */}
                <div className="absolute bottom-2 w-16 h-5 bg-black/40 rounded-[50%] blur-[3px] -z-10 group-active:scale-90 transition-transform" />
                
                {/* 가구 아이콘 (스케일업하여 현실적인 크기감 부여) */}
                <span className="text-[5rem] leading-none drop-shadow-md filter transition-transform group-hover:scale-105 group-active:scale-95 group-active:-translate-y-2">
                  {item.icon}
                </span>

                {/* 삭제 버튼 */}
                <button 
                  onClick={() => handleRemoveFurniture(item.instanceId)} 
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-focus-within:opacity-100 transition shadow-lg z-20"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          ))}

          {layout.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-60">
              <Box size={40} className="text-white mb-2 drop-shadow" />
              <p className="font-bold text-white drop-shadow-md">하단에서 가구를 꺼내 방을 꾸며보세요!</p>
            </div>
          )}
        </div>
      </div>

      {/* 📦 하단 인벤토리 (가구 창고) */}
      <div className="h-40 bg-white/60 backdrop-blur-md border-t border-white/40 rounded-t-[2rem] p-5 flex items-center space-x-4 overflow-x-auto shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
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
                className={`flex-shrink-0 w-24 h-28 bg-white border-2 rounded-2xl flex flex-col items-center justify-center relative transition-all shadow-sm ${
                  count > 0 
                  ? 'border-transparent hover:border-blue-400 hover:shadow-md cursor-pointer hover:-translate-y-1' 
                  : 'border-gray-200 opacity-50 cursor-not-allowed grayscale'
                }`}
              >
                <span className="text-4xl mb-2 drop-shadow-sm">{itemData?.icon}</span>
                <span className="text-xs font-extrabold text-gray-700">{itemData?.name}</span>
                
                {/* 남은 수량 뱃지 */}
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-black w-7 h-7 rounded-full flex items-center justify-center border-[3px] border-white shadow-sm">
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