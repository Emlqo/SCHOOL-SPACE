import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 컨트롤러 공유 상태 조작을 위한 전역 공유 객체 (상태값 연동 최소화로 성능 최적화)
const controlInput = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  lookDeltaX: 0,
  lookDeltaY: 0
};

// ==========================================
// 🕹️ 하이브리드(모바일 터치 + PC 키보드) 엔진 컨트롤러
// ==========================================
function HybridPlayerController() {
  const { camera } = useThree();
  const speed = 0.12; // 한 프레임당 이동 속도
  const lookSensitivity = 0.005; // 시점 회전 민감도

  // 내부 시점 각도 값 관리 (YXZ 회전 순서 고정으로 짐벌락 방지)
  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    camera.rotation.order = 'YXZ';

    // PC 환경용 키보드 이벤트 리스너 등록
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

  // 매 프레임마다 물리 연산 처리 루프
  useFrame(() => {
    // 1. 시점 회전 처리 (터치 드래그 또는 마우스 드래그 누적값 반영)
    yaw.current -= controlInput.lookDeltaX * lookSensitivity;
    pitch.current -= controlInput.lookDeltaY * lookSensitivity;

    // 위아래 수직 시점 각도를 -85도 ~ +85도로 엄격하게 제한
    pitch.current = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, pitch.current));

    camera.rotation.x = pitch.current;
    camera.rotation.y = yaw.current;
    camera.rotation.z = 0;

    // 소모된 회전 변화량 초기화
    controlInput.lookDeltaX = 0;
    controlInput.lookDeltaY = 0;

    // 2. 이동 벡터 연산
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0; // 수평축 고정
    direction.normalize();

    const sideDirection = new THREE.Vector3();
    sideDirection.crossVectors(camera.up, direction).normalize();

    if (controlInput.forward) camera.position.addScaledVector(direction, speed);
    if (controlInput.backward) camera.position.addScaledVector(direction, -speed);
    if (controlInput.left) camera.position.addScaledVector(sideDirection, speed);
    if (controlInput.right) camera.position.addScaledVector(sideDirection, -speed);

    // 3. 복도 외곽 경계선 충돌벽 좌표 처리
    if (camera.position.x > 3.3) camera.position.x = 3.3;
    if (camera.position.x < -3.3) camera.position.x = -3.3;
    if (camera.position.z > 1) camera.position.z = 1;
    if (camera.position.z < -45) camera.position.z = -45;
  });

  return null;
}

// ==========================================
// 🏫 3D 학교 복도 그래픽 환경 컴포넌트
// ==========================================
function SchoolHallwayScene() {
  const segments = Array.from({ length: 5 });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 4, -10]} intensity={0.8} distance={30} />
      <pointLight position={[0, 4, -30]} intensity={0.8} distance={30} />

      {/* 바닥 바운더리 매핑 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -25]}>
        <planeGeometry args={[8, 60]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>

      {/* 천장 구조물 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, -25]}>
        <planeGeometry args={[8, 60]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>

      {/* 좌측 학교 벽면 */}
      <mesh position={[-4, 2.5, -25]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[60, 5]} />
        <meshStandardMaterial color="#f0fdf4" roughness={0.8} />
      </mesh>

      {/* 우측 학교 벽면 */}
      <mesh position={[4, 2.5, -25]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[60, 5]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>

      {/* 내부 인테리어 반복 배치 파츠 */}
      {segments.map((_, index) => {
        const zPos = -8 - index * 9;
        return (
          <group key={index}>
            {/* 교실 문 */}
            <mesh position={[-3.96, 1.3, zPos]}>
              <boxGeometry args={[0.05, 2.6, 1.4]} />
              <meshStandardMaterial color="#92400e" roughness={0.6} />
            </mesh>
            {/* 손잡이 오브젝트 */}
            <mesh position={[-3.9, 1.3, zPos + 0.5]}>
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshStandardMaterial color="#facc15" metalness={0.7} />
            </mesh>
            {/* 교실 알림 표지판 */}
            <mesh position={[-3.9, 2.8, zPos]}>
              <boxGeometry args={[0.02, 0.2, 0.5]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {/* 복도 학급 알림용 게시판 */}
            <mesh position={[-3.96, 1.8, zPos - 2.5]}>
              <boxGeometry args={[0.03, 1.2, 2.2]} />
              <meshStandardMaterial color="#b45309" />
            </mesh>
            <mesh position={[-3.94, 1.8, zPos - 2.5]}>
              <boxGeometry args={[0.01, 1.0, 2.0]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.9} />
            </mesh>
            {/* 천장 등기구 몰딩 */}
            <mesh position={[0, 4.96, zPos - 1.2]}>
              <boxGeometry args={[0.5, 0.05, 1.5]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* 복도 막다른 벽면 종료 지점 */}
      <mesh position={[0, 2.5, -55]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
    </>
  );
}

// ==========================================
// 🌐 스테이지 엔트리 래퍼 (터치 인터페이스 레이아웃)
// ==========================================
export default function GameStage({ dbUser }) {
  // 조이스틱 드래그 연산 상태값
  const [joystick, setJoystick] = useState({ dragging: false, startX: 0, startY: 0, moveX: 0, moveY: 0 });
  const lookTouchId = useRef(null);
  const lastLookX = useRef(0);
  const lastLookY = useRef(0);

  // 🚀 터치 조이스틱 인터랙션 핸들러
  const handleJoystickStart = (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    setJoystick({
      dragging: true,
      startX: touch.clientX,
      startY: touch.clientY,
      moveX: 0,
      moveY: 0
    });
  };

  const handleJoystickMove = (e) => {
    if (!joystick.dragging) return;
    e.preventDefault();
    const touch = [...e.touches].find(t => t.target.closest('.joystick-zone'));
    if (!touch) return;

    const diffX = touch.clientX - joystick.startX;
    const diffY = touch.clientY - joystick.startY;

    // 최대 드래그 반경을 45px로 조절 및 제한 구속 연산
    const distance = Math.hypot(diffX, diffY);
    const maxRadius = 45;
    let clampedX = diffX;
    let clampedY = diffY;

    if (distance > maxRadius) {
      clampedX = (diffX / distance) * maxRadius;
      clampedY = (diffY / distance) * maxRadius;
    }

    setJoystick(prev => ({ ...prev, moveX: clampedX, moveY: clampedY }));

    // 조이스틱 밀림 강도 스레스홀드 검사 및 플래그 셋업
    controlInput.forward = clampedY < -15;
    controlInput.backward = clampedY > 15;
    controlInput.left = clampedX < -15;
    controlInput.right = clampedX > 15;
  };

  const handleJoystickEnd = () => {
    setJoystick({ dragging: false, startX: 0, startY: 0, moveX: 0, moveY: 0 });
    // 전역 이동 제어 플래그 즉시 롤백 복구
    controlInput.forward = false;
    controlInput.backward = false;
    controlInput.left = false;
    controlInput.right = false;
  };

  // 🚀 화면 우측 영역 터치 스와이프 시점 전환 인터랙션 핸들러
  const handleLookStart = (e) => {
    if (e.target.closest('.joystick-zone')) return; // 조이스틱 패널 영역 터치면 패스
    const touch = e.changedTouches[0];
    lookTouchId.current = touch.identifier;
    lastLookX.current = touch.clientX;
    lastLookY.current = touch.clientY;
  };

  const handleLookMove = (e) => {
    if (lookTouchId.current === null) return;
    const touch = [...e.touches].find(t => t.identifier === lookTouchId.current);
    if (!touch) return;

    const deltaX = touch.clientX - lastLookX.current;
    const deltaY = touch.clientY - lastLookY.current;

    // 실시간 시점 축적 제어 데이터에 할당
    controlInput.lookDeltaX += deltaX;
    controlInput.lookDeltaY += deltaY;

    lastLookX.current = touch.clientX;
    lastLookY.current = touch.clientY;
  };

  const handleLookEnd = (e) => {
    const touch = [...e.changedTouches].find(t => t.identifier === lookTouchId.current);
    if (touch) {
      lookTouchId.current = null;
    }
  };

  // 🚀 PC 마우스 드래그 시점 전환 인터랙션 핸들러
  const isMouseLooking = useRef(false);
  const handleMouseDown = (e) => {
    if (e.target.closest('.joystick-zone')) return;
    isMouseLooking.current = true;
    lastLookX.current = e.clientX;
    lastLookY.current = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (!isMouseLooking.current) return;
    const deltaX = e.clientX - lastLookX.current;
    const deltaY = e.clientY - lastLookY.current;

    controlInput.lookDeltaX += deltaX;
    controlInput.lookDeltaY += deltaY;

    lastLookX.current = e.clientX;
    lastLookY.current = e.clientY;
  };

  const handleMouseUp = () => {
    isMouseLooking.current = false;
  };

  return (
    <div 
      className="w-full h-full relative bg-slate-900 overflow-hidden select-none touch-none"
      onPointerDown={handleMouseDown}
      onPointerMove={handleMouseMove}
      onPointerUp={handleMouseUp}
      onPointerLeave={handleMouseUp}
      onTouchStart={handleLookStart}
      onTouchMove={handleLookMove}
      onTouchEnd={handleLookEnd}
    >
      {/* 3D 캔버스 그래픽 뷰포트 레이어 */}
      <Canvas camera={{ position: [0, 2, 0], fov: 65 }} className="w-full h-full">
        <SchoolHallwayScene />
        <HybridPlayerController />
      </Canvas>

      {/* 🚀 모바일 전용 UI 레이아웃 터치 오버레이 컨트롤러 */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-end justify-between p-8">
        
        {/* 좌측 하단 조이스틱 구역 패널 */}
        <div 
          className="joystick-zone pointer-events-auto w-32 h-32 bg-black/20 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center relative touch-none"
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
        >
          {/* 가상 아날로그 스틱 노브 패드 */}
          <div 
            className="w-12 h-12 bg-white/70 rounded-full shadow-lg transition-transform duration-75"
            style={{
              transform: `translate(${joystick.moveX}px, ${joystick.moveY}px)`
            }}
          />
        </div>

        {/* 우측 하단 조작 가이드 안내 데스크 패널 */}
        <div className="bg-slate-900/70 text-white/80 p-3 rounded-xl text-[10px] font-medium backdrop-blur-sm tracking-tight pointer-events-none">
          📱 터치 조작: 좌측 스틱 이동 / 우측 드래그 시점<br/>
          💻 PC 조작: WASD 이동 / 화면 드래그 시점
        </div>
      </div>
    </div>
  );
}