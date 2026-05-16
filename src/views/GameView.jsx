import React, { useState } from 'react';
import GameStage from './GameStage';
import RoomDecorationView from './RoomDecorationView';
import ClosetView from './ClosetView';
import ShopModal from '../components/ShopModal';
import { LogOut, Sparkles } from 'lucide-react';

export default function GameView({ dbUser, onLogout }) {
  const [currentTab, setCurrentTab] = useState('world'); 
  const [isShopOpen, setIsShopOpen] = useState(false);

  return (
    <div className="h-screen bg-green-50 flex flex-col p-4 overflow-hidden relative">
      <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-4 shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">{dbUser.name[0]}</div>
          <div>
            <p className="text-xs text-gray-500">{dbUser.school} {dbUser.grade}-{dbUser.classNumber}</p>
            <h1 className="font-bold text-gray-800">{dbUser.name}</h1>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button onClick={() => setCurrentTab('world')} className={`px-4 py-2 rounded-xl font-bold text-sm transition ${currentTab === 'world' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}>🌍 광장</button>
          <button onClick={() => setCurrentTab('room')} className={`px-4 py-2 rounded-xl font-bold text-sm transition ${currentTab === 'room' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>내 방</button>
          <button onClick={() => setCurrentTab('closet')} className={`px-4 py-2 rounded-xl font-bold text-sm transition ${currentTab === 'closet' ? 'bg-pink-500 text-white' : 'bg-gray-100'}`}>옷장</button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-yellow-100 px-3 py-1.5 rounded-xl flex items-center text-sm">
            <span className="text-yellow-600 font-bold mr-1">💰</span><span className="font-bold text-yellow-700">{dbUser.money}</span>
          </div>
          <button onClick={() => setIsShopOpen(true)} className="bg-blue-500 text-white px-3 py-1.5 rounded-xl text-sm font-bold flex items-center hover:bg-blue-600"><Sparkles size={16} className="mr-1"/>상점</button>
          <button onClick={onLogout} className="text-gray-400 hover:text-gray-600"><LogOut size={18} /></button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative rounded-2xl shadow-sm border-4 border-white">
        {currentTab === 'world' && <GameStage dbUser={dbUser} />}
        {currentTab === 'room' && <RoomDecorationView dbUser={dbUser} />}
        {currentTab === 'closet' && <ClosetView dbUser={dbUser} />}
      </div>

      {isShopOpen && <ShopModal dbUser={dbUser} onClose={() => setIsShopOpen(false)} />}
    </div>
  );
}
