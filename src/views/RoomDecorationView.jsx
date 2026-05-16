import React, { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { SHOP_ITEMS } from '../constants/items';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

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
