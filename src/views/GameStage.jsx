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
      backgroundColor: '#FFF8DC', // 따뜻하고 밝은 상아색 복도 바닥
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
      },
      scene: { preload, create, update },
      scale: { mode: Phaser.Scale.RESIZE }
    };

    const game = new Phaser.Game(config);
    let playerContainer;
    let targetPos = null; // 터치/클릭 목표 좌표

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

      // 🏢 2. 교무실 문
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

      // 🗄️ 4. 사물함
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
      g.fillStyle(0xEF4444, 1);
      g.fillRoundedRect(0, 0, 20, 30, 4);
      g.fillStyle(0x1F2937, 1);
      g.fillRect(5, -5, 10, 5);
      g.fillStyle(0xFCD34D, 1);
      g.fillRect(4, 10, 12, 10);
      g.generateTexture('fire-ext', 20, 35);
      g.clear();

      // 🪜 6. 중앙 계단 (회전 렌더링 호환을 위해 정사각형 비율 수정)
      g.fillStyle(0x9CA3AF, 1);
      g.fillRect(0, 0, 120, 120);
      g.fillStyle(0x6B7280, 1);
      g.fillRect(20, 0, 20, 120);
      g.fillRect(60, 0, 20, 120);
      g.fillRect(100, 0, 20, 120);
      g.generateTexture('stairs', 120, 120);
      g.clear();
    }

    // ==========================================
    // 2. 맵과 캐릭터 배치 (Create)
    // ==========================================
    function create() {
      const halfCount = 7;
      const hallwayWidth = halfCount * 220 + 450; // 한 줄에 7개 반 기준 가로 길이 대폭 압축
      const hallwayHeight = 650; // 위아래 배치를 위한 세로폭 여유 증대

      this.physics.world.setBounds(0, 0, hallwayWidth, hallwayHeight);

      // 🚀 핵심 배치 기준선 타겟팅
      const topWallY = 140;
      const bottomWallY = 510;

      // 상단 벽지 영역 (파스텔 민트)
      this.add.rectangle(hallwayWidth / 2, topWallY / 2, hallwayWidth, topWallY, 0xE0FFFF);
      // 하단 벽지 영역 (파스텔 민트)
      this.add.rectangle(hallwayWidth / 2, bottomWallY + (hallwayHeight - bottomWallY) / 2, hallwayWidth, hallwayHeight - bottomWallY, 0xE0FFFF);
      
      // 상하 자물쇠 물리 충돌 경계선 수립
      const topWall = this.add.rectangle(hallwayWidth / 2, topWallY / 2, hallwayWidth, topWallY, 0x000000, 0);
      this.physics.add.existing(topWall, true);

      const bottomWall = this.add.rectangle(hallwayWidth / 2, bottomWallY + (hallwayHeight - bottomWallY) / 2, hallwayWidth, hallwayHeight - bottomWallY, 0x000000, 0);
      this.physics.add.existing(bottomWall, true);

      // 🏢 상단 벽 맨 왼쪽: 교무실 안착
      this.add.image(140, topWallY - 5, 'office-door').setOrigin(0.5, 1);
      const officeSignBg = this.add.rectangle(140, topWallY - 120, 60, 24, 0xFFFFFF).setStrokeStyle(2, 0x333333);
      officeSignBg.isStroked = true;
      this.add.text(140, topWallY - 120, `교무실`, { fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#333' }).setOrigin(0.5);

      // 🏫 1반 ~ 14반 분할 2열 대칭 루프
      for (let i = 1; i <= 14; i++) {
        if (i <= 7) {
          // 👉 1 ~ 7반 : 상단 벽 배치라인
          const xPos = 320 + (i - 1) * 220;
          
          this.add.image(xPos, topWallY - 5, 'cute-door').setOrigin(0.5, 1);
          
          const signBg = this.add.rectangle(xPos, topWallY - 110, 50, 24, 0xFFFFFF).setStrokeStyle(2, 0x333333);
          signBg.isStroked = true;
          this.add.text(xPos, topWallY - 110, `${i}반`, { fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#333' }).setOrigin(0.5);

          // 소품 인테리어
          this.add.image(xPos + 70, topWallY - 5, 'lockers').setOrigin(0.5, 1);
          if (i % 2 === 0) this.add.image(xPos + 110, topWallY - 60, 'board');
          if (i % 3 === 0) this.add.image(xPos + 140, topWallY - 5, 'fire-ext').setOrigin(0.5, 1);
          
        } else {
          // 👉 8 ~ 14반 : 하단 벽 배치라인
          const idx = i - 7; // 하단 기준 1~7번째 정렬 인덱스 연산
          const xPos = 320 + (idx - 1) * 220;
          
          // 문을 하단 벽 시작점에 딱 붙여 복도 방향으로 노출
          this.add.image(xPos, bottomWallY + 5, 'cute-door').setOrigin(0.5, 0);
          
          const signBg = this.add.rectangle(xPos, bottomWallY + 110, 50, 24, 0xFFFFFF).setStrokeStyle(2, 0x333333);
          signBg.isStroked = true;
          this.add.text(xPos, bottomWallY + 110, `${i}반`, { fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#333' }).setOrigin(0.5);

          // 소품 인테리어 (하단 정렬 스냅셋)
          this.add.image(xPos + 70, bottomWallY + 5, 'lockers').setOrigin(0.5, 0);
          if (i % 2 === 0) this.add.image(xPos + 110, bottomWallY + 60, 'board');
          if (i % 3 === 0) this.add.image(xPos + 140, bottomWallY + 5, 'fire-ext').setOrigin(0.5, 0);
        }
      }

      // 🪜 복도 맨 오른쪽 끝 중앙: 다른 학년 전용 이동 계단
      const stairX = hallwayWidth - 100;
      const stairY = (topWallY + bottomWallY) / 2;
      this.add.image(stairX, stairY, 'stairs').setOrigin(0.5, 0.5);
      this.add.text(stairX, stairY - 80, '다른 층 이동', { 
        fontFamily: 'sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#333', backgroundColor: '#FFD700', padding: { x: 8, y: 4 }
      }).setOrigin(0.5);

      // ==========================================
      // 👤 아바타 동적 렌더링 (2등신 셋업)
      // ==========================================
      playerContainer = this.add.container(250, 320);
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
      
      // 이중 벽 구조 듀얼 충돌 물리 연결
      this.physics.add.collider(playerContainer, topWall);
      this.physics.add.collider(playerContainer, bottomWall);
      
      this.cameras.main.startFollow(playerContainer, true, 0.08, 0.08);
      this.cameras.main.setBounds(0, 0, hallwayWidth, hallwayHeight);

      // 마우스 클릭 / 터치 패닝 연산 통합 핸들러
      this.input.on('pointerdown', (pointer) => {
        targetPos = { x: pointer.worldX, y: pointer.worldY };

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
    // 3. 매 프레임 업데이트 (목표 방향 최적 추적)
    // ==========================================
    function update() {
      if (!playerContainer.body) return;

      const speed = 240;

      if (targetPos) {
        const dx = targetPos.x - playerContainer.x;
        const dy = targetPos.y - playerContainer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
          const angle = Math.atan2(dy, dx);
          playerContainer.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
          );
        } else {
          playerContainer.body.setVelocity(0);
          targetPos = null;
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
            <span className="text-xs text-indigo-600 font-bold mb-2">👆 바닥을 터치하면 아바타가 걸어갑니다!</span>
            
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