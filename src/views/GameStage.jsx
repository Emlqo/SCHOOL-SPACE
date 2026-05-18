import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Html, ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ==========================================
// 👤 3D 아바타 컴포넌트 (애니메이션 부재 방어 코드 적용)
// ==========================================
function Avatar({ targetPos, dbUser }) {
  const group = useRef();
  
  // public/models/avatar.glb 파일을 안전하게 로드
  const { scene } = useGLTF('/models/avatar.glb');

  // 매 프레임마다 목표 지점을 향해 이동하는 로직
  useFrame((state, delta) => {
    if (!group.current || !targetPos) return;

    const current = group.current.position;
    // Y축은 바닥 고정, X축과 Z축만 목표 좌표로 타겟팅
    const target = new THREE.Vector3(targetPos.x, current.y, targetPos.z);
    const distance = current.distanceTo(target);

    if (distance > 0.05) {
      const speed = 4; // 이동 속도
      const direction = target.clone().sub(current).normalize();
      group.current.position.add(direction.multiplyScalar(speed * delta));
      
      // 캐릭터가 이동하는 방향을 바라보도록 부드럽게 회전 처리
      const targetRotation = Math.atan2(direction.x, direction.z);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotation, 0.15);
    } else {
      current.x = target.x;
      current.z = target.z;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]} dispose={null}>
      {/* 🚀 AI 모델의 특성을 고려한 최적화 세팅:
        중심점을 살짝 맞추고(position), 크기가 너무 크거나 작게 튀지 않도록 scale을 적절히 조절합니다.
      */}
      <primitive object={scene} scale={2} position={[0, 0, 0]} />
      
      {/* 아바타 머리 위에 이름표 둥둥 띄우기 */}
      <Html position={[0, 2.2, 0]} center zIndexRange={[100, 0]}>
        <div className="bg-slate-900/80 text-white px-3 py-1 rounded-full text-xs font-black border border-white/20 whitespace-nowrap shadow-md backdrop-blur-sm">
          {dbUser?.name || '학생'}
        </div>
      </Html>
    </group>
  );
}

// ==========================================
// 🏫 3D 배경 및 바닥 컴포넌트
// ==========================================
function SceneEnvironment({ setTargetPos }) {
  const handlePointerDown = (e) => {
    e.stopPropagation();
    // 클릭한 지점의 정확한 3D 월드 좌표를 부모에게 전달
    setTargetPos({ x: e.point.x, z: e.point.z });
  };

  return (
    <group>
      {/* 메타버스 세상을 화사하게 비춰줄 조명 */}
      <ambientLight intensity={1.0} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.4} />

      {/* 바닥 구역 (클릭/터치 시 캐릭터가 이동할 판판한 도화지) */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        onPointerDown={handlePointerDown}
      >
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#DEB887" roughness={0.6} /> {/* 아늑한 나무톤 바닥 */}
      </mesh>

      {/* 가이드라인 격자 배치 (공간의 입체감과 크기감을 직관적으로 파악) */}
      <gridHelper args={[60, 30, '#8B4513', '#D2B48C']} position={[0, 0.01, 0]} />

      {/* 정면 대형 학교 인테리어 벽면 */}
      <mesh position={[0, 3, -15]}>
        <boxGeometry args={[40, 6, 0.5]} />
        <meshStandardMaterial color="#5E9F69" /> {/* 교실 느낌의 초록 벽 */}
      </mesh>
      
      {/* 캐릭터 발밑에 자연스러운 음영을 주는 실시간 둥근 그림자 */}
      <ContactShadows position={[0, 0.02, 0]} opacity={0.5} scale={15} blur={1.5} far={3} />
    </group>
  );
}

// ==========================================
// 🎮 메인 3D 캔버스 뷰 컨테이너
// ==========================================
export default function GameStage({ dbUser, onOpenCloset }) {
  const [targetPos, setTargetPos] = useState(null);

  return (
    <div className="w-full h-full relative bg-[#F3F0E9]" style={{ minHeight: '400px' }}>
      {/* Three.js 3D 렌더링 엔진 가동 */}
      <Canvas 
        camera={{ position: [12, 12, 12], fov: 40 }}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={
          <Html center>
            <div className="flex flex-col items-center justify-center bg-white/90 p-5 rounded-2xl shadow-xl border border-gray-100">
              <span className="text-3xl animate-bounce mb-2">🏫</span>
              <div className="text-sm font-black text-gray-700 animate-pulse">3D 달코미 스페이스 로딩 중...</div>
            </div>
          </Html>
        }>
          <SceneEnvironment setTargetPos={setTargetPos} />
          <Avatar targetPos={targetPos} dbUser={dbUser} />
          
          {/* 🎮 자유 시점 구경 기능 추가:
            화면을 마우스 우클릭 드래그하거나 모바일 두 손가락으로 가볍게 밀면 
            방 꾸미기처럼 자유롭게 카메라 시점을 돌려볼 수 있어 직관성이 배가 됩니다.
          */}
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2.1} // 바닥 밑으로 카메라가 내려가지 않게 차단
            minDistance={5}
            maxDistance={30}
          />
        </Suspense>
      </Canvas>

      {/* 2.5D 하이브리드 UI 오버레이 */}
      <div className="absolute top-4 left-4 pointer-events-none z-20">
        <div className="bg-white/95 px-4 py-3 rounded-2xl shadow-md border border-slate-100 flex flex-col backdrop-blur-sm">
          <span className="font-black text-slate-800 text-sm mb-0.5 flex items-center">
            ✨ 진짜 3D 월드 광장
          </span>
          <span className="text-[11px] text-indigo-600 font-extrabold mb-2.5">
            👆 바닥 격자를 누르면 달코미가 그곳으로 걸어갑니다!
          </span>
          <button 
            onClick={onOpenCloset} 
            className="text-xs bg-pink-500 text-white font-bold px-3 py-1.5 rounded-full pointer-events-auto shadow-sm hover:bg-pink-600 transition active:scale-95 text-center"
          >
            👗 옷방 가기
          </button>
        </div>
      </div>
    </div>
  );
}

// ⚠️ 브라우저 메모리 최적화를 위한 3D 프리로드 셋업
useGLTF.preload('/models/avatar.glb');