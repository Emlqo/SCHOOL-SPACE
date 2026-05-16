import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Html } from '@react-three/drei';
import * as THREE from 'three';

// 컨트롤러 공유 상태
const controlInput = { forward: false, backward: false, left: false, right: false, lookDeltaX: 0, lookDeltaY: 0 };

// ==========================================
// 🕹️ 하이브리드 플레이어 컨트롤러
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
    // 모바일 터치 환경일 때만 커스텀 시점 회전 적용 (PC는 PointerLockControls가 자동 처리)
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

    // 이동 처리
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

    // 14개 반 크기에 맞춘 복도 경계선 (Z축 한계치 대폭 증가)
    if (camera.position.x > 3.3) camera.position.x = 3.3;
    if (camera.position.x < -3.3) camera.position.x = -3.3;
    if (camera.position.z > 2) camera.position.z = 2;
    if (camera.position.z < -130) camera.position.z = -130;
  });

  return null;
}

// ==========================================
// 🏫 디테일업된 학교 복도 환경 컴포넌트
// ==========================================
function EnhancedSchoolHallway() {
  // 1반부터 14반까지 생성
  const classesCount = 14;
  const segments = Array.from({ length: classesCount });
  const corridorLength = classesCount * 9 + 10;
  const corridorCenterZ = -(corridorLength / 2) + 4;
  
  const lockerColors = ['#3b82f6', '#eab308', '#22c55e', '#ef4444', '#f97316'];

  return (
    <>
      {/* ☀️ 밝고 화사한 조명 세팅 */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 10, -20]} intensity={1.5} color="#fffbeb" castShadow />
      
      {/* 복도 길이에 맞춰 일정한 간격으로 포인트 조명 배치 */}
      {segments.map((_, i) => (
        i % 2 === 0 && <pointLight key={`light-${i}`} position={[0, 4, -8 - i * 9]} intensity={0.5} distance={20} />
      ))}

      {/* 바닥 (따뜻한 나무색) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, corridorCenterZ]}>
        <planeGeometry args={[8, corridorLength]} />
        <meshStandardMaterial color="#d97706" roughness={0.7} />
      </mesh>

      {/* 천장 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, corridorCenterZ]}>
        <planeGeometry args={[8, corridorLength]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>

      {/* 좌우 벽면 (화사한 아이보리) */}
      <mesh position={[-4, 2.5, corridorCenterZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[corridorLength, 5]} />
        <meshStandardMaterial color="#fffbeb" roughness={0.8} />
      </mesh>
      <mesh position={[4, 2.5, corridorCenterZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[corridorLength, 5]} />
        <meshStandardMaterial color="#fffbeb" roughness={0.8} />
      </mesh>

      {/* 하단 나무 걸레받이 디테일 */}
      <mesh position={[-3.95, 0.2, corridorCenterZ]}><boxGeometry args={[0.1, 0.4, corridorLength]} /><meshStandardMaterial color="#78350f" /></mesh>
      <mesh position={[3.95, 0.2, corridorCenterZ]}><boxGeometry args={[0.1, 0.4, corridorLength]} /><meshStandardMaterial color="#78350f" /></mesh>

      {/* 🚀 교실 문, 표지판, 창문, 사물함 반복 배치 */}
      {segments.map((_, index) => {
        const zPos = -8 - index * 9;
        const currentClass = index + 1;
        const lColor = lockerColors[index % lockerColors.length];

        return (
          <group key={index}>
            {/* --- 왼쪽: 교실 구역 --- */}
            <mesh position={[-3.96, 1.3, zPos]}><boxGeometry args={[0.05, 2.6, 1.4]} /><meshStandardMaterial color="#8b5a2b" /></mesh>
            <mesh position={[-3.9, 1.3, zPos + 0.5]}><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color="#fcd34d" metalness={0.6} /></mesh>
            
            {/* 🏫 문 위 반 이름 표지판 (HTML 오버레이를 3D 공간에 합성) */}
            <Html transform position={[-3.95, 3.2, zPos]} rotation={[0, Math.PI / 2, 0]}>
              <div className="bg-white border-4 border-gray-800 px-4 py-1 flex flex-col items-center justify-center rounded-xl shadow-lg w-32 pointer-events-none">
                <span className="text-[10px] font-black text-gray-400 mb-[-4px]">SCHOOL</span>
                <span className="text-2xl font-black text-gray-800">{currentClass} 반</span>
              </div>
            </Html>

            {/* 교실 사이 알림판 */}
            <mesh position={[-3.96, 1.8, zPos - 3.5]}><boxGeometry args={[0.03, 1.4, 2.4]} /><meshStandardMaterial color="#b45309" /></mesh>
            <mesh position={[-3.94, 1.8, zPos - 3.5]}><boxGeometry args={[0.01, 1.2, 2.2]} /><meshStandardMaterial color="#e0f2fe" /></mesh>

            {/* 천장 형광등 */}
            <mesh position={[0, 4.96, zPos]}><boxGeometry args={[0.6, 0.05, 2]} /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} /></mesh>

            {/* --- 오른쪽: 사물함 및 창문 구역 --- */}
            {/* 알록달록 사물함 (문 맞은편 약간 옆) */}
            <mesh position={[3.8, 1, zPos - 1]}><boxGeometry args={[0.4, 2, 3]} /><meshStandardMaterial color={lColor} roughness={0.6} /></mesh>
            
            {/* 복도 유리 창문 (사물함 위) */}
            <mesh position={[3.95, 3.2, zPos - 1]}><boxGeometry args={[0.05, 1.5, 3]} /><meshStandardMaterial color="#bae6fd" transparent opacity={0.4} /></mesh>
            {/* 창틀 */}
            <mesh position={[3.9, 3.2, zPos - 1]}><boxGeometry args={[0.1, 1.6, 3.1]} /><meshStandardMaterial color="#94a3b8" wireframe /></mesh>
          </group>
        );
      })}

      {/* 복도 끝 막다른 벽 */}
      <mesh position={[0, 2.5, -corridorLength + 4]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
    </>
  );
}

// ==========================================
// 🌐 스테이지 엔트리 래퍼 (기기 자동 감지 하이브리드)
// ==========================================
export default function GameStage({ dbUser }) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // 접속 기기 판별 (터치가 가능한 기기인지)
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // 모바일 조이스틱 및 시점 제어 상태
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
        
        {/* PC 전용: 완벽한 FPS 마우스 고정 컨트롤러 */}
        {!isTouchDevice && (
          <PointerLockControls 
            onLock={() => setIsLocked(true)} 
            onUnlock={() => setIsLocked(false)} 
          />
        )}
      </Canvas>

      {/* 💻 PC 전용 오버레이 가이드 (잠금 해제 시 나타남) */}
      {!isTouchDevice && !isLocked && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30 pointer-events-none p-4 text-center backdrop-blur-sm">
          <div className="bg-white/10 border border-white/20 p-8 rounded-3xl max-w-md pointer-events-auto shadow-2xl">
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

      {/* 📱 모바일 전용 조이스틱 오버레이 */}
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

      <div className="absolute top-4 left-4 bg-slate-900/80 text-white px-4 py-2 rounded-xl text-xs font-bold shadow border border-slate-700 pointer-events-none z-20">
        📍 학교 1층 복도
      </div>
    </div>
  );
}