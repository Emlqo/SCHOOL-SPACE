import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

export default function GameStage({ dbUser, onOpenCloset }) {
  const gameRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // React StrictMode 이중 렌더링 방지
    if (gameRef.current.children.length > 0) return;

    const config = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: gameRef.current,
      backgroundColor: '#FFF8DC', // 따뜻하고 밝은 상아색 바닥
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
      },
      scene: { preload, create, update },
      scale: { mode: Phaser.Scale.RESIZE }
    };

    const game = new Phaser.Game(config);
    let playerContainer;
    let targetPos = null; // 🚀 터치/클릭한 목표 좌표를 저장할 변수

    // ==========================================
    // 1. 에셋 준비 (코드로 직접 그래픽 그리기)
    // ==========================================
    function preload() {
      const g = this.make.graphics({ x: 0, y: 0, add: false });

      // 🚪 1. 일반 교실 문
      g.fillStyle(0x87CEFA, 1);
      g.fillRoundedRect(0, 0, 60, 90, 8);
      g.fillStyle(0xFFFFFF, 0.8);
      g.fillRect(10, 10, 40, 30);
      g.fillStyle(0xFFA500, 1);
      g.fillCircle(50, 50, 4);
      g.generateTexture('cute-door', 60, 90);
      g.clear();

      // 🏢 2. 교무실 문 (더 크고 무거운 나무 느낌)
      g.fillStyle(0xCD853F, 1); 
      g.fillRoundedRect(0, 0, 80, 100, 8);
      g.fillStyle(0xFFFFFF, 0.6);
      g.fillRect(15, 15, 50, 40);
      g.fillStyle(0x8B4513, 1);
      g.fillCircle(70, 55, 5);
      g.generateTexture('office-door', 80, 100);
      g.clear();

      // 🟩 3. 게시판
      g.fillStyle(0xDEB887, 1);
      g.fillRect(0, 0, 80, 50);
      g.fillStyle(0xFFFFFF, 1);
      g.fillRect(10, 10, 20, 25);
      g.fillStyle(0xFFFFF0, 1);
      g.fillRect(40, 15, 30, 20);
      g.generateTexture('board', 80, 50);
      g.clear();

      // 🗄️ 4. 사물함 (회색 3칸짜리 세트)
      g.fillStyle(0x9CA3AF, 1);
      g.fillRect(0, 0, 60, 70);
      g.lineStyle(2, 0x4B5563, 1);
      g.strokeRect(0, 0, 20, 70);
      g.strokeRect(20, 0, 20, 70);
      g.strokeRect(40, 0, 20, 70);
      g.fillStyle(0x374151, 1);
      g.fillRect(12, 35, 4, 10);
      g.fillRect(32, 35, 4, 10);
      g.fillRect(52, 35, 4, 10);
      g.generateTexture('lockers', 60, 70);
      g.clear();

      // 🧯 5. 소화기 함
      g.fillStyle(0xEF4444, 1); // 빨강
      g.fillRoundedRect(0, 0, 20, 30, 4);
      g.fillStyle(0x1F2937, 1);
      g.fillRect(5, -5, 10, 5); // 손잡이
      g.fillStyle(0xFCD34D, 1);
      g.fillRect(4, 10, 12, 10); // 노란 라벨
      g.generateTexture('fire-ext', 20, 35);
      g.clear();

      // 🪜 6. 중앙 계단 (바닥으로 내려가는 듯한 착시)
      g.fillStyle(0x9CA3AF, 1);
      g.fillRect(0, 0, 160, 80);
      g.fillStyle(0x6B7280, 1);
      g.fillRect(0, 20, 160, 20);
      g.fillStyle(0x4B5563, 1);
      g.fillRect(0, 40, 160, 20);
      g.fillStyle(0x374151, 1);
      g.fillRect(0, 60, 160, 20);
      g.generateTexture('stairs', 160, 80);
      g.clear();
    }

    // ==========================================
    // 2. 맵과 캐릭터 배치 (Create)
    // ==========================================
    function create() {
      const classesCount = 14;
      const hallwayWidth = classesCount * 180 + 400; // 맵 길이를 더 넉넉하게 확장
      const hallwayHeight = 800;

      this.physics.world.setBounds(0, 0, hallwayWidth, hallwayHeight);

      const wallHeight = 150;
      this.add.rectangle(hallwayWidth / 2, wallHeight / 2, hallwayWidth, wallHeight, 0xE0FFFF);
      
      const topWall = this.add.rectangle(hallwayWidth / 2, wallHeight / 2, hallwayWidth, wallHeight, 0x000000, 0);
      this.physics.add.existing(topWall, true);

      // 🏢 복도 맨 왼쪽: 교무실 세팅
      this.add.image(150, wallHeight - 5, 'office-door').setOrigin(0.5, 1);
      const officeSignBg = this.add.rectangle(150, wallHeight - 120, 60, 24, 0xFFFFFF).setStrokeStyle(2, 0x333333);
      officeSignBg.isStroked = true;
      this.add.text(150, wallHeight - 120, `교무실`, { fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#333' }).setOrigin(0.5);

      // 🏫 1반 ~ 14반, 그리고 사물함과 소화기 배치
      for (let i = 1; i <= classesCount; i++) {
        const xPos = 300 + i * 180;
        
        // 교실 문
        this.add.image(xPos, wallHeight - 5, 'cute-door').setOrigin(0.5, 1);
        
        // 반 표지판
        const signBg = this.add.rectangle(xPos, wallHeight - 110, 50, 24, 0xFFFFFF).setStrokeStyle(2, 0x333333);
        signBg.isStroked = true;
        this.add.text(xPos, wallHeight - 110, `${i}반`, { fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#333' }).setOrigin(0.5);

        // 교실 사이사이 디테일 채우기
        if (i < classesCount) {
          // 사물함 (문과 문 사이 1/3 지점)
          this.add.image(xPos + 60, wallHeight - 5, 'lockers').setOrigin(0.5, 1);
          // 짝수 반 사이에는 게시판
          if (i % 2 === 0) this.add.image(xPos + 90, wallHeight - 60, 'board');
          // 3개 반마다 소화기
          if (i % 3 === 0) this.add.image(xPos + 120, wallHeight - 5, 'fire-ext').setOrigin(0.5, 1);
        }
      }

      // 🪜 화면 중앙 아래: 다른 학년으로 가는 계단 배치
      const centerX = hallwayWidth / 2;
      const stairY = hallwayHeight - 10;
      this.add.image(centerX, stairY, 'stairs').setOrigin(0.5, 1);
      this.add.text(centerX, stairY - 100, '▼ 다른 층으로 이동 ▼', { 
        fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#333', backgroundColor: '#FFD700', padding: { x: 10, y: 5 }
      }).setOrigin(0.5);

      // ==========================================
      // 👤 아바타 동적 렌더링 (괴물화 방지 코드 유지)
      // ==========================================
      playerContainer = this.add.container(200, 300);
      playerContainer.setSize(32, 40);
      this.physics.world.enable(playerContainer);
      
      const clothesIcon = dbUser?.equipped?.clothes?.icon || '👕';
      const clothesText = this.add.text(0, 12, clothesIcon, { fontSize: '32px' }).setOrigin(0.5);
      
      const hairIcon = dbUser?.equipped?.hair?.icon || '🧑';
      const hairText = this.add.text(0, -12, hairIcon, { fontSize: '32px' }).setOrigin(0.5);
      
      const nameTagBg = this.add.rectangle(0, -40, 60, 18, 0xFFFFFF, 0.8).setOrigin(0.5);
      const nameTag = this.add.text(0, -40, dbUser?.name || '학생', { fontFamily: 'sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#333' }).setOrigin(0.5);
      
      playerContainer.add([clothesText, hairText, nameTagBg, nameTag]);
      playerContainer.body.setCollideWorldBounds(true);
      this.physics.add.collider(playerContainer, topWall);
      
      this.cameras.main.startFollow(playerContainer, true, 0.08, 0.08);
      this.cameras.main.setBounds(0, 0, hallwayWidth, hallwayHeight);

      // 🚀 마우스 클릭 / 화면 터치 이동 이벤트
      this.input.on('pointerdown', (pointer) => {
        targetPos = { x: pointer.worldX, y: pointer.worldY };

        // 클릭한 곳에 귀여운 핑크 마커 이펙트
        const marker = this.add.circle(pointer.worldX, pointer.worldY, 6, 0xFF69B4);
        this.tweens.add({
          targets: marker,
          scale: 2.5,
          alpha: 0,
          duration: 400,
          onComplete: () => marker.destroy()
        });
      });

      setIsReady(true);
    }

    // ==========================================
    // 3. 매 프레임 업데이트 (목표 지점으로 걷기)
    // ==========================================
    function update() {
      if (!playerContainer.body) return;

      const speed = 220; // 걷는 속도

      // 목표 좌표가 설정되어 있다면
      if (targetPos) {
        const dx = targetPos.x - playerContainer.x;
        const dy = targetPos.y - playerContainer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 목표 지점에 거의 도달하면 멈춤 (부들거림 방지)
        if (distance > 5) {
          const angle = Math.atan2(dy, dx);
          playerContainer.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
          );
        } else {
          playerContainer.body.setVelocity(0);
          targetPos = null; // 도착 완료
        }
      } else {
        playerContainer.body.setVelocity(0);
      }
    }

    return () => {
      game.destroy(true);
    };
  }, [dbUser]);

  return (
    <div className="w-full h-full relative bg-[#FFF8DC]">
      <div ref={gameRef} className="w-full h-full" />
      
      {isReady && (
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="bg-white/90 px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <span className="font-black text-gray-800 text-sm mb-1">🏫 귀여운 2D 학교 복도</span>
            <span className="text-xs text-indigo-600 font-bold mb-2">👆 가고 싶은 바닥을 터치(클릭) 하세요!</span>
            
            <button 
              onClick={onOpenCloset} 
              className="text-xs bg-pink-500 text-white font-bold px-3 py-1.5 rounded-full pointer-events-auto shadow-sm hover:bg-pink-600 transition"
            >
              👗 나만의 캐릭터 꾸미기 (옷방)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}