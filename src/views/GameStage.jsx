import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

// ==========================================
// 🕹️ 1인칭 키보드 이동 컨트롤러 컴포넌트
// ==========================================
function FirstPersonPlayer() {
  const { camera } = useThree();
  const speed = 0.15; // 이동 속도

  // 키 입력 상태 저장
  const keys = useRef({ w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() in keys.current) keys.current[e.key.toLowerCase()] = true;
      if (e.key in keys.current) keys.current[e.key] = true;
    };
    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() in keys.current) keys.current[e.key.toLowerCase()] = false;
      if (e.key in keys.current) keys.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 매 프레임마다 카메라 위치 계산 (렌더링 루프 내부)
  useFrame(() => {
    // 카메라가 바라보는 방향 벡터 구하기
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0; // 위아래 움직임 배제 (수평 이동)
    direction.normalize();

    // 측면(오른쪽) 방향 벡터 구하기
    const sideDirection = new THREE.Vector3();
    sideDirection.crossVectors(camera.up, direction).normalize();

    // 앞/뒤 이동 (W, S, 방향키 위/아래)
    if (keys.current.w || keys.current.ArrowUp) {
      camera.position.addScaledVector(direction, speed);
    }
    if (keys.current.s || keys.current.ArrowDown) {
      camera.position.addScaledVector(direction, -speed);
    }
    // 좌/우 이동 (A, D, 방향키 좌/우)
    if (keys.current.a || keys.current.ArrowLeft) {
      camera.position.addScaledVector(sideDirection, speed);
    }
    if (keys.current.d || keys.current.ArrowRight) {
      camera.position.addScaledVector(sideDirection, -speed);
    }

    // 복도 경계선 이탈 방지 (간단한 충돌 벽 경계 설정)
    if (camera.position.x > 3.5) camera.position.x = 3.5;
    if (camera.position.x < -3.5) camera.position.x = -3.5;
    if (camera.position.z > 1) camera.position.z = 1;      // 뒤쪽 한계
    if (camera.position.z < -45) camera.position.z = -45;  // 복도 끝 한계
  });

  return null;
}

// ==========================================
// 🏫 3D 학교 복도 공간 환경 컴포넌트
// ==========================================
function SchoolHallwayScene() {
  // 복도에 일정 간격으로 교실 문과 게시판 배치하기 위한 배열 생성
  const corridorSegments = Array.from({ length: 5 }); 

  return (
    <>
      {/* 기본 조명 세팅 */}
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 4, -10]} intensity={0.8} distance={30} castShadow />
      <pointLight position={[0, 4, -30]} intensity={0.8} distance={30} castShadow />

      {/* 바닥 (타일 스타일 색상) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -25]} receiveShadow>
        <planeGeometry args={[8, 60]} />
        <meshStandardMaterial color="#dedede" roughness={0.4} />
      </mesh>

      {/* 천장 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, -25]}>
        <planeGeometry args={[8, 60]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>

      {/* 왼쪽 벽 */}
      <mesh position={[-4, 2.5, -25]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[60, 5]} />
        <meshStandardMaterial color="#f0fdf4" roughness={0.8} /> {/* 연한 초록빛 벽면 */}
      </mesh>

      {/* 오른쪽 벽 (창문이나 외부 전경이 들어설 수 있는 면) */}
      <mesh position={[4, 2.5, -25]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[60, 5]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>

      {/* 🚀 복도 내부 인테리어 에셋 배치 (문, 게시판, 하단 걸레받이) */}
      {corridorSegments.map((_, index) => {
        const zPos = -8 - index * 9; // 각 교실의 세로 위치 기준점
        return (
          <group key={index}>
            {/* 왼쪽 벽면 교실 문 */}
            <mesh position={[-3.95, 1.3, zPos]}>
              <boxGeometry args={[0.05, 2.6, 1.4]} />
              <meshStandardMaterial color="#b45309" roughness={0.5} /> {/* 갈색 나무 문 */}
            </mesh>
            {/* 문 손잡이 */}
            <mesh position={[-3.9, 1.3, zPos + 0.5]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshStandardMaterial color="#facc15" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* 반 이름 표지판 */}
            <mesh position={[-3.9, 2.9, zPos]}>
              <boxGeometry args={[0.02, 0.2, 0.5]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>

            {/* 교실 옆 게시판 디자인 항목 */}
            <mesh position={[-3.95, 1.8, zPos - 2.5]}>
              <boxGeometry args={[0.03, 1.2, 2.2]} />
              <meshStandardMaterial color="#ca8a04" roughness={0.7} />
            </mesh>
            <mesh position={[-3.93, 1.8, zPos - 2.5]}>
              <boxGeometry args={[0.01, 1.0, 2.0]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.9} /> {/* 파란 알림판 내지 */}
            </mesh>

            {/* 천장 형광등 광원 매핑 */}
            <mesh position={[0, 4.95, zPos - 1.2]}>
              <boxGeometry args={[0.4, 0.05, 1.5]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
            </mesh>
          </group>
        );
      })}

      {/* 복도 정면 끝 막힘 벽 */}
      <mesh position={[0, 2.5, -55]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
    </>
  );
}

// ==========================================
// 🌐 스테이지 엔트리 래퍼
// ==========================================
export default function GameStage({ dbUser }) {
  const [isLocked, setIsLocked] = useState(false);

  return (
    <div className="w-full h-full relative bg-slate-900 select-none">
      {/* 1인칭 환경용 3D 캔버스 엔진 */}
      <Canvas 
        shadows 
        camera={{ position: [0, 2, 0], fov: 60 }} // 카메라 위치: 높이 2(사람 눈높이), 화각 60도
        className="w-full h-full"
      >
        <SchoolHallwayScene />
        <FirstPersonPlayer />
        
        {/* 🚀 Drei 제공 1인칭 마우스 조작 컨트롤러락 */}
        <PointerLockControls 
          onLock={() => setIsLocked(true)} 
          onUnlock={() => setIsLocked(false)} 
        />
      </Canvas>

      {/* overlay 가이드 조작계 UI */}
      {!isLocked && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30 pointer-events-none p-4 text-center">
          <div className="bg-white/10 border border-white/20 p-6 rounded-3xl max-w-sm backdrop-blur-md pointer-events-auto shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-2">3D 메타버스 복도</h2>
            <p className="text-blue-300 text-sm font-bold mb-4">화면을 클릭하면 시점이 고정됩니다.</p>
            <div className="flex flex-col items-center space-y-2 text-gray-300 text-xs text-left border-t border-white/10 pt-4">
              <p>👀 <b>시점 전환:</b> 마우스 이동</p>
              <p>🏃 <b>캐릭터 이동:</b> W, A, S, D 또는 키보드 방향키</p>
              <p>🔓 <b>마우스 해제:</b> ESC 키 입력</p>
            </div>
            <button className="mt-6 w-full bg-blue-500 text-white font-black py-3 rounded-xl shadow-md hover:bg-blue-600 active:scale-95 transition">
              시작하기 (화면 클릭)
            </button>
          </div>
        </div>
      )}

      {/* HUD: 현재 위치 좌표계 실시간 모니터링 */}
      <div className="absolute bottom-4 left-4 bg-slate-900/80 text-white px-4 py-2 rounded-xl text-xs font-mono shadow border border-slate-700 pointer-events-none z-10">
        🎮 1인칭 모드 구동 중 (WASD 조작)
      </div>
    </div>
  );
}