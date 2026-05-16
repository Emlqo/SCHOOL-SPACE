import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function GameStage({ dbUser }) {
  const stageRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 1. 층수 상태 관리
  const [currentFloor, setCurrentFloor] = useState(1);
  
  // 2. 근접한 문(Door) 상태 관리
  const [nearbyDoor, setNearbyDoor] = useState(null);

  // 층별 배경색 및 텍스트 설정
  const FLOORS = {
    1: { name: '1학년 복도', bgClass: 'bg-green-100' },
    2: { name: '2학년 복도', bgClass: 'bg-blue-100' },
    3: { name: '3학년 복도', bgClass: 'bg-yellow-100' }
  };

  // 교실 문 데이터 (xPct는 화면 너비 대비 X좌표 비율 0~1)
  const DOORS = [
    { id: 'class_1', name: `${currentFloor}학년 1반`, xPct: 0.25 },
    { id: 'class_2', name: `${currentFloor}학년 2반`, xPct: 0.50 },
    { id: 'class_3', name: `${currentFloor}학년 3반`, xPct: 0.75 },
  ];
  
  const DOOR_Y = 160; // 문이 위치한 Y 좌표 (위에서부터의 픽셀 거리)
  const INTERACTION_RADIUS = 80; // 문과 아바타가 상호작용하는 반경 (픽셀)

  // 컴포넌트 마운트 시 초기 중앙 좌표 설정
  useEffect(() => {
    if (stageRef.current && !isInitialized) {
      const rect = stageRef.current.getBoundingClientRect();
      setPosition({ x: rect.width / 2, y: rect.height / 2 });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // 마우스/터치 클릭 시 아바타 이동 목표 좌표 업데이트
  const handlePointerDown = (e) => {
    // 팝업 버튼이나 UI를 클릭했을 때는 이동하지 않도록 방어 로직
    if (e.target.closest('button')) return;

    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;
    setPosition({ x: targetX, y: targetY });
  };

  // 🚀 피타고라스 정리를 활용한 실시간 근접 체크 로직
  const checkProximity = (currentX, currentY) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();

    let foundDoor = null;

    // 모든 문을 순회하며 아바타의 현재 위치와 거리를 계산
    for (const door of DOORS) {
      const doorPixelX = rect.width * door.xPct; // 문의 실제 픽셀 X 좌표
      const doorPixelY = DOOR_Y; // 문의 실제 픽셀 Y 좌표

      // Math.hypot를 사용하여 두 점 사이의 직선 거리 계산
      const distance = Math.hypot(currentX - doorPixelX, currentY - doorPixelY);

      // 반경 이내로 들어왔다면 foundDoor로 지정
      if (distance < INTERACTION_RADIUS) {
        foundDoor = door;
        break; // 하나라도 찾으면 중단
      }
    }

    // 상태가 변경되었을 때만 업데이트 (무한 렌더링 방지)
    if (foundDoor?.id !== nearbyDoor?.id) {
      setNearbyDoor(foundDoor);
    }
  };

  const avatarIcon = dbUser?.equipped?.clothes?.icon || '🧍';
  const hairIcon = dbUser?.equipped?.hair?.icon || '';

  return (
    <div 
      ref={stageRef}
      onPointerDown={handlePointerDown}
      // 층마다 배경색(bgClass)이 동적으로 변함
      className={`w-full h-full relative overflow-hidden cursor-crosshair transition-colors duration-500 ${FLOORS[currentFloor].bgClass}`}
      style={{
        // 팁: 선생님이 올려주신 이미지를 배경으로 쓰시려면 아래 코드를 활성화하세요!
        // backgroundImage: 'url("/선생님_이미지_이름.png")', 
        // backgroundSize: 'cover',
        // backgroundPosition: 'center'
      }}
    >
      {/* 바닥 타일/그리드 연출 */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '40px 40px' }} />

      {/* 중앙 안내 문구 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black font-bold text-4xl pointer-events-none opacity-10 select-none">
        {FLOORS[currentFloor].name}
      </div>

      {/* 🚀 상단 벽에 배치된 교실 문(Doors) 렌더링 */}
      {DOORS.map((door) => (
        <div 
          key={door.id} 
          className="absolute flex flex-col items-center pointer-events-none"
          style={{ 
            left: `${door.xPct * 100}%`, 
            top: `${DOOR_Y}px`, 
            transform: 'translate(-50%, -100%)' // 중앙 하단 기준 정렬
          }}
        >
          {/* 문 디자인 (선생님 이미지의 문과 비슷한 느낌으로 구현) */}
          <div className="w-20 h-32 bg-amber-700 border-4 border-amber-900 rounded-t-xl relative flex justify-center shadow-lg">
            <div className="absolute top-4 w-12 h-12 bg-blue-100 opacity-50 rounded border-2 border-amber-900"></div> {/* 유리창 */}
            <div className="absolute top-1/2 right-2 w-3 h-3 bg-yellow-400 rounded-full"></div> {/* 손잡이 */}
          </div>
          {/* 반 이름 표지판 */}
          <div className="absolute -top-6 bg-white px-3 py-1 text-sm font-black text-gray-800 rounded-lg shadow-md border-2 border-gray-200 whitespace-nowrap z-10">
            {door.name}
          </div>
        </div>
      ))}

      {/* 아바타 렌더링 영역 */}
      {isInitialized && (
        <motion.div
          className="absolute z-20 w-16 h-16 -ml-8 -mt-8 flex flex-col items-center justify-center pointer-events-none"
          animate={{ x: position.x, y: position.y }}
          transition={{ type: "tween", ease: "linear", duration: 0.5 }}
          // 🚀 아바타가 이동하는 프레임마다 실시간 좌표를 가져와서 근접 체크!
          onUpdate={(latest) => checkProximity(latest.x, latest.y)}
        >
          <div className="relative flex flex-col items-center">
            {/* 아바타 이름표 */}
            <div className="absolute -top-8 bg-white/90 text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap border border-gray-100">
              {dbUser.name}
            </div>
            {/* 옷과 헤어 */}
            <div className="relative flex items-center justify-center">
              {hairIcon && <div className="absolute top-[-10px] text-5xl z-20">{hairIcon}</div>}
              <div className="text-6xl z-10">{avatarIcon}</div>
            </div>

            {/* 🚀 팝업 UI: 특정 문에 근접했을 때만 아바타 머리 위에 나타남 */}
            {nearbyDoor && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-20 bg-blue-500 text-white font-black px-4 py-2 rounded-2xl shadow-xl whitespace-nowrap pointer-events-auto border-2 border-white hover:bg-blue-600 animate-bounce"
                onClick={() => alert(`${nearbyDoor.name}에 입장합니다! (기능 준비 중)`)}
              >
                🚪 {nearbyDoor.name} 입장하기
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* 우측 하단: 층수 이동 UI (계단 버튼) */}
      <div className="absolute bottom-6 right-6 flex flex-col bg-white p-2 rounded-2xl shadow-lg border-2 border-gray-100">
        <span className="text-xs font-bold text-gray-500 text-center mb-2">계단</span>
        {[3, 2, 1].map((floor) => (
          <button
            key={floor}
            onClick={() => setCurrentFloor(floor)}
            className={`w-12 h-12 mb-2 last:mb-0 rounded-xl font-black text-lg transition ${
              currentFloor === floor 
                ? 'bg-blue-500 text-white shadow-inner' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {floor}F
          </button>
        ))}
      </div>
    </div>
  );
}