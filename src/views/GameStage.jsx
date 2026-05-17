import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Html, ContactShadows, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';

// ==========================================
// 👤 3D 아바타 컴포넌트
// ==========================================
function Avatar({ targetPos, dbUser }) {
  const group = useRef();
  
  // 🚀 public/models/avatar.glb 파일을 불러옵니다.
  const { scene, animations } = useGLTF('/models/avatar.glb');
  const { actions, names } = useAnimations(animations, group);

  const [currentAnim, setCurrentAnim] = useState(null);

  // 애니메이션 이름 자동 추출 및 기본 모션 세팅
  useEffect(() => {
    console.log("🔥 GLB에 포함된 애니메이션 목록:", names);
    
    // 파일에 애니메이션이 있다면, 기본적으로 첫 번째 모션을 실행합니다.
    if (names.length > 0 && !currentAnim) {
      setCurrentAnim(names[0]); 
    }
  }, [names]);

  // 애니메이션 재생 제어
  useEffect(() => {
    if (currentAnim && actions[currentAnim]) {
      actions[currentAnim].reset().fadeIn(0.2).play();
      return () => actions[currentAnim].fadeOut(0.2);
    }
  }, [currentAnim, actions]);

  // 매 프레임마다 목표 지점을 향해 걷는 로직
  useFrame((state, delta) => {
    if (!group.current || !targetPos) return;

    const current = group.current.position;
    const target = new THREE.Vector3(targetPos.x, current.y, targetPos.z);
    const distance = current.distanceTo(target);

    if (distance > 0.1) {
      // 1. 이동
      const speed = 2.5;
      const direction = target.clone().sub(current).normalize();
      group.current.position.add(direction.multiplyScalar(speed * delta));
      
      // 2. 부드러운 회전 (목표 지점 바라보기)
      const targetRotation = Math.atan2(direction.x, direction.z);
      // Math.PI를 더하거나 빼서 모델이 정면을 보게 방향을 조정할 수 있습니다.
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotation, 0.1);

      // 💡 TODO: 나중에 콘솔창에서 걷기(Walk) 애니메이션 이름을 찾으면 여기에 넣습니다.
      // if (names.includes('Walk') && currentAnim !== 'Walk') setCurrentAnim('Walk');
    } else {
      // 💡 TODO: 도착하면 다시 대기(Idle) 모션으로 변경합니다.
      // if (names.includes('Idle') && currentAnim !== 'Idle') setCurrentAnim('Idle');
    }
  });

  return (
    <group ref={group} dispose={null}>
      {/* 3D 모델 본체 */}
      <primitive object={scene} scale={1.5} position={[0, 0, 0]} />
      
      {/* 이름표 둥둥 띄우기 */}
      <Html position={[0, 3, 0]} center zIndexRange={[100, 0]}>
        <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-white/20 whitespace-nowrap backdrop-blur-sm shadow-xl">
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
  // 바닥 클릭 시 좌표 계산
  const handlePointerDown = (e) => {
    e.stopPropagation();
    setTargetPos({ x: e.point.x, z: e.point.z });
  };

  return (
    <group>
      {/* 조명 세팅 */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#E0FFFF" />

      {/* 바닥 (클릭 이벤트 감지용) */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        receiveShadow 
        onPointerDown={handlePointerDown}
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#CD9158" />
      </mesh>

      {/* 복도 뒷면 메인 벽 */}
      <mesh position={[0, 2.5, -5]} receiveShadow castShadow>
        <boxGeometry args={[30, 5, 0.5]} />
        <meshStandardMaterial color="#5E9F69" />
      </mesh>
      
      {/* 바닥 그림자 효과 (캐릭터 발밑) */}
      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={20} blur={2} far={4} />
    </group>
  );
}

// ==========================================
// 🎮 메인 렌더링 컨테이너
// ==========================================
export default function GameStage({ dbUser, onOpenCloset }) {
  const [targetPos, setTargetPos] = useState(null);

  return (
    <div className="w-full h-full relative bg-[#F3F0E9]">
      <Canvas shadows>
        {/* 본디(Bondee) 스타일의 아이소메트릭 쿼터뷰 카메라 */}
        <OrthographicCamera makeDefault position={[15, 15, 15]} zoom={40} />
        
        <Suspense fallback={<Html center><div className="text-xl font-bold animate-pulse text-gray-500">3D 세계 로딩 중...</div></Html>}>
          <SceneEnvironment setTargetPos={setTargetPos} />
          <Avatar targetPos={targetPos} dbUser={dbUser} />
        </Suspense>
      </Canvas>

      {/* UI 오버레이 */}
      <div className="absolute top-4 left-4 pointer-events-none z-10">
        <div className="bg-white/90 px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <span className="font-black text-gray-800 text-sm mb-1">🏫 3D 메타버스 복도</span>
          <span className="text-xs text-indigo-600 font-bold mb-2">👆 바닥을 클릭하여 아바타를 이동시키세요!</span>
          <button 
            onClick={onOpenCloset} 
            className="text-xs bg-pink-500 text-white font-bold px-3 py-1.5 rounded-full pointer-events-auto shadow-sm hover:bg-pink-600 transition"
          >
            👗 옷방 가기
          </button>
        </div>
      </div>
    </div>
  );
}

// ⚠️ 로딩을 미리 하기 위한 preload
useGLTF.preload('/models/avatar.glb');