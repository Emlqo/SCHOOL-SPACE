import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Html } from '@react-three/drei';
import * as THREE from 'three';

// 🕹️ 컨트롤러 상태
const controlInput = { forward: false, backward: false, left: false, right: false, lookDeltaX: 0, lookDeltaY: 0 };

// ==========================================
// 🏃 하이브리드 플레이어 컨트롤러
// ==========================================
function HybridPlayerController({ isTouch }) {
  const { camera } = useThree();
  const speed = 0.15;
  const lookSensitivity = 0.005;

  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    camera.rotation.order = 'YXZ';

    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') controlInput.forward = true;
      if (e.key.toLowerCase() === 's' || e.key === 'ArrowDown') controlInput.backward = true;
      if (e.key.toLowerCase() === 'a' || e.key === 'ArrowLeft') controlInput.left = true;
      if (e.key.toLowerCase() === 'd' || e.key === 'ArrowRight') controlInput.right = true;
    };

    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') controlInput.forward = false;
      if (e.key.toLowerCase() === 's' || e.key === 'ArrowDown') controlInput.backward = false;
      if (e.key.toLowerCase() === 'a' || e.key === 'ArrowLeft') controlInput.left = false;
      if (e.key.toLowerCase() === 'd' || e.key === 'ArrowRight') controlInput.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera]);

  useFrame(() => {
    if (isTouch) {
      yaw.current -= controlInput.lookDeltaX * lookSensitivity;
      pitch.current -= controlInput.lookDeltaY * lookSensitivity;
      pitch.current = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, pitch.current));

      camera.rotation.x = pitch.current;
      camera.rotation.y = yaw.current;
      camera.rotation.z = 0;

      controlInput.lookDeltaX = 0;
      controlInput.lookDeltaY = 0;
    }

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const sideDirection = new THREE.Vector3();
    sideDirection.crossVectors(camera.up, direction).normalize();

    if (controlInput.forward) camera.position.addScaledVector(direction, speed);
    if (controlInput.backward) camera.position.addScaledVector(direction, -speed);
    if (controlInput.left) camera.position.addScaledVector(sideDirection, speed);
    if (controlInput.right) camera.position.addScaledVector(sideDirection, -speed);

    if (camera.position.x > 3.3) camera.position.x = 3.3;
    if (camera.position.x < -3.3) camera.position.x = -3.3;
    if (camera.position.z > 2) camera.position.z = 2;
    if (camera.position.z < -130) camera.position.z = -130;
  });

  return null;
}

// ==========================================
// 🏫 디테일업된 리얼 학교 복도 환경
// ==========================================
function EnhancedSchoolHallway() {
  const classesCount = 14;
  const segments = Array.from({ length: classesCount });
  const corridorLength = classesCount * 9 + 10;
  const corridorCenterZ = -(corridorLength / 2) + 4;

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, -20]} intensity={1.0} color="#fff" castShadow />
      
      {segments.map((_, i) => (
        i % 2 === 0 && <pointLight key={`light-${i}`} position={[0, 4, -8 - i * 9]} intensity={0.4} distance={20} />
      ))}

      {/* 바닥 (광택 있는 마룻바닥) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, corridorCenterZ]}>
        <planeGeometry args={[8, corridorLength]} />
        <meshStandardMaterial color="#b45309" roughness={0.3} />
      </mesh>

      {/* 천장 (텍스처 톤다운) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, corridorCenterZ]}>
        <planeGeometry args={[8, corridorLength]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>

      {/* 🚀 벽면 디테일: 상단 흰색, 하단 연한 옥색(학교 페인트 느낌) 투톤 분리 */}
      {/* 상단 벽 */}
      <mesh position={[-4, 3.1, corridorCenterZ]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[corridorLength, 3.8]} /><meshStandardMaterial color="#f8fafc" /></mesh>
      <mesh position={[4, 3.1, corridorCenterZ]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[corridorLength, 3.8]} /><meshStandardMaterial color="#f8fafc" /></mesh>
      {/* 하단 벽 */}
      <mesh position={[-3.98, 0.6, corridorCenterZ]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[corridorLength, 1.2]} /><meshStandardMaterial color="#dcfce7" /></mesh>
      <mesh position={[3.98, 0.6, corridorCenterZ]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[corridorLength, 1.2]} /><meshStandardMaterial color="#dcfce7" /></mesh>
      {/* 투톤 분리선 (몰딩) */}
      <mesh position={[-3.95, 1.2, corridorCenterZ]}><boxGeometry args={[0.05, 0.05, corridorLength]} /><meshStandardMaterial color="#94a3b8" /></mesh>
      <mesh position={[3.95, 1.2, corridorCenterZ]}><boxGeometry args={[0.05, 0.05, corridorLength]} /><meshStandardMaterial color="#94a3b8" /></mesh>

      {/* 각 반별 디테일 인테리어 배치 */}
      {segments.map((_, index) => {
        const zPos = -8 - index * 9;
        const currentClass = index + 1;

        return (
          <group key={index}>
            {/* 🚪 교실 문 디테일 */}
            <mesh position={[-3.96, 1.3, zPos]}><boxGeometry args={[0.05, 2.6, 1.4]} /><meshStandardMaterial color="#8b5a2b" /></mesh>
            {/* 문 손잡이 */}
            <mesh position={[-3.9, 1.3, zPos + 0.5]}><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color="#cbd5e1" metalness={0.8} /></mesh>
            {/* 문 유리창 */}
            <mesh position={[-3.93, 1.7, zPos]}><boxGeometry args={[0.02, 0.8, 0.6]} /><meshStandardMaterial color="#bae6fd" transparent opacity={0.6} roughness={0.1} /></mesh>
            
            {/* 문 위 반 이름 표지판 */}
            <Html transform position={[-3.95, 3.2, zPos]} rotation={[0, Math.PI / 2, 0]}>
              <div className="bg-white border-4 border-gray-800 px-4 py-1 flex flex-col items-center justify-center rounded-xl shadow-lg w-32 pointer-events-none">
                <span className="text-[10px] font-black text-gray-400 mb-[-4px]">CLASSROOM</span>
                <span className="text-2xl font-black text-gray-800">{currentClass} 반</span>
              </div>
            </Html>

            {/* 📋 교실 사이 복도 게시판 */}
            <group position={[-3.96, 1.8, zPos - 3.5]}>
              <mesh><boxGeometry args={[0.03, 1.4, 2.4]} /><meshStandardMaterial color="#8b4513" /></mesh> {/* 나무 프레임 */}
              <mesh position={[0.02, 0, 0]}><boxGeometry args={[0.01, 1.2, 2.2]} /><meshStandardMaterial color="#d2b48c" /></mesh> {/* 코르크 보드 */}
              {/* 붙어있는 종이들 */}
              <mesh position={[0.03, 0.2, -0.5]}><boxGeometry args={[0.01, 0.4, 0.3]} /><meshStandardMaterial color="#ffffff" /></mesh>
              <mesh position={[0.03, -0.2, 0.2]}><boxGeometry args={[0.01, 0.3, 0.4]} /><meshStandardMaterial color="#fffae6" /></mesh>
              <mesh position={[0.03, 0.1, 0.6]}><boxGeometry args={[0.01, 0.4, 0.3]} /><meshStandardMaterial color="#e0f2fe" /></mesh>
            </group>

            {/* 💡 천장 형광등 */}
            <mesh position={[0, 4.96, zPos]}><boxGeometry args={[0.6, 0.05, 2]} /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} /></mesh>

            {/* 🗄️ 철제 사물함 디테일 (오른쪽 벽) */}
            <group position={[3.8, 1.2, zPos - 1]}>
              <mesh><boxGeometry args={[0.4, 2.4, 3]} /><meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.6} /></mesh>
              {/* 사물함 3칸 구분을 위한 디테일 선 및 손잡이 */}
              {[-0.8, 0, 0.8].map((offset) => (
                <group key={offset} position={[-0.21, 0, offset]}>
                  {/* 손잡이 */}
                  <mesh position={[0, 0.2, -0.3]}><boxGeometry args={[0.02, 0.15, 0.05]} /><meshStandardMaterial color="#334155" /></mesh>
                  {/* 환풍구 */}
                  <mesh position={[0, 0.8, 0]}><boxGeometry args={[0.01, 0.2, 0.2]} /><meshStandardMaterial color="#334155" /></mesh>
                </group>
              ))}
            </group>

            {/* 🧯 소화기 함 (3개 반마다 1개씩) */}
            {index % 3 === 0 && (
              <group position={[3.9, 1.0, zPos - 5]}>
                <mesh><boxGeometry args={[0.1, 0.8, 0.6]} /><meshStandardMaterial color="#ef4444" /></mesh>
                <mesh position={[-0.06, 0, 0]}><boxGeometry args={[0.01, 0.6, 0.4]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.6} /></mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* 복도 끝 막다른 벽 */}
      <mesh position={[0, 2.5, -corridorLength + 4]} rotation={[0, Math.PI, 0]}><planeGeometry args={[8, 5]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
    </>
  );
}

// ==========================================
// 🌐 스테이지 엔트리 래퍼 (안내문 클릭 방해 버그 픽스)
// ==========================================
export default function GameStage({ dbUser }) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const [joystick, setJoystick] = useState({ dragging: false, startX: 0, startY: 0, moveX: 0, moveY: 0 });
  const lookTouchId = useRef(null);
  const lastLookX = useRef(0);
  const lastLookY = useRef(0);

  const handleJoystickStart = (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    setJoystick({ dragging: true, startX: touch.clientX, startY: touch.clientY, moveX: 0, moveY: 0 });
  };

  const handleJoystickMove = (e) => {
    if (!joystick.dragging) return;
    const touch = [...e.touches].find(t => t.target.closest('.joystick-zone'));
    if (!touch) return;

    const diffX = touch.clientX - joystick.startX;
    const diffY = touch.clientY - joystick.startY;
    const distance = Math.hypot(diffX, diffY);
    const maxRadius = 45;
    const clampedX = distance > maxRadius ? (diffX / distance) * maxRadius : diffX;
    const clampedY = distance > maxRadius ? (diffY / distance) * maxRadius : diffY;

    setJoystick(prev => ({ ...prev, moveX: clampedX, moveY: clampedY }));
    controlInput.forward = clampedY < -15;
    controlInput.backward = clampedY > 15;
    controlInput.left = clampedX < -15;
    controlInput.right = clampedX > 15;
  };

  const handleJoystickEnd = () => {
    setJoystick({ dragging: false, startX: 0, startY: 0, moveX: 0, moveY: 0 });
    controlInput.forward = controlInput.backward = controlInput.left = controlInput.right = false;
  };

  const handleLookStart = (e) => {
    if (e.target.closest('.joystick-zone')) return;
    const touch = e.changedTouches[0];
    lookTouchId.current = touch.identifier;
    lastLookX.current = touch.clientX;
    lastLookY.current = touch.clientY;
  };

  const handleLookMove = (e) => {
    if (lookTouchId.current === null) return;
    const touch = [...e.touches].find(t => t.identifier === lookTouchId.current);
    if (!touch) return;
    controlInput.lookDeltaX += touch.clientX - lastLookX.current;
    controlInput.lookDeltaY += touch.clientY - lastLookY.current;
    lastLookX.current = touch.clientX;
    lastLookY.current = touch.clientY;
  };

  const handleLookEnd = (e) => {
    if ([...e.changedTouches].some(t => t.identifier === lookTouchId.current)) {
      lookTouchId.current = null;
    }
  };

  return (
    <div 
      className="w-full h-full relative bg-slate-900 overflow-hidden select-none touch-none"
      onTouchStart={isTouchDevice ? handleLookStart : undefined}
      onTouchMove={isTouchDevice ? handleLookMove : undefined}
      onTouchEnd={isTouchDevice ? handleLookEnd : undefined}
    >
      <Canvas camera={{ position: [0, 2, 0], fov: 65 }} className="w-full h-full">
        <EnhancedSchoolHallway />
        <HybridPlayerController isTouch={isTouchDevice} />
        
        {/* PC 전용 마우스 잠금 (화면 클릭 시 활성화) */}
        {!isTouchDevice && (
          <PointerLockControls 
            onLock={() => setIsLocked(true)} 
            onUnlock={() => setIsLocked(false)} 
          />
        )}
      </Canvas>

      {/* 🚀 PC 전용 오버레이: pointer-events-none을 적용하여 화면 클릭이 캔버스로 통과하도록 수정! */}
      {!isTouchDevice && !isLocked && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30 pointer-events-none p-4 text-center backdrop-blur-sm">
          <div className="bg-white/10 border border-white/20 p-8 rounded-3xl max-w-md shadow-2xl pointer-events-none">
            <h2 className="text-3xl font-black text-white mb-2">우리 학교 메타버스</h2>
            <p className="text-blue-300 text-base font-bold mb-6">화면을 클릭하면 복도로 입장합니다.</p>
            <div className="flex flex-col items-center space-y-3 text-gray-200 text-sm font-medium text-left border-t border-white/10 pt-6">
              <p>👀 <b>시점 전환:</b> 마우스 이동</p>
              <p>🏃 <b>캐릭터 이동:</b> W, A, S, D 키보드</p>
              <p>🔓 <b>마우스 꺼내기:</b> ESC 키 입력</p>
            </div>
            <p className="mt-8 text-white/50 text-xs animate-pulse">화면 아무 곳이나 클릭하여 시작</p>
          </div>
        </div>
      )}

      {/* 📱 모바일 전용 조이스틱 */}
      {isTouchDevice && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-end justify-between p-6">
          <div 
            className="joystick-zone pointer-events-auto w-32 h-32 bg-black/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center relative touch-none shadow-xl"
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
          >
            <div 
              className="w-12 h-12 bg-white/80 rounded-full shadow-lg transition-transform duration-75"
              style={{ transform: `translate(${joystick.moveX}px, ${joystick.moveY}px)` }}
            />
          </div>
          <div className="bg-slate-900/60 text-white/80 p-3 rounded-xl text-[11px] font-bold backdrop-blur-sm tracking-tight pointer-events-none border border-white/10 shadow-lg">
            좌측 스틱: 이동<br/>우측 화면: 시점 전환
          </div>
        </div>
      )}

      {/* 내비게이션 배지 */}
      <div className="absolute top-4 left-4 bg-slate-900/80 text-white px-4 py-2 rounded-xl text-xs font-bold shadow border border-slate-700 pointer-events-none z-20">
        📍 학교 복도 (1반 ~ 14반)
      </div>
    </div>
  );
}