import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

export default function GameStage({ dbUser, onOpenCloset }) {
  const gameRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // React StrictMode 이중 렌더링 방지
    if (gameRef.current.children.length > 0) return;

    // ==========================================
    // 🌍 씬 1: 학교 복도 광장 (HallwayScene)
    // ==========================================
    class HallwayScene extends Phaser.Scene {
      constructor() {
        super({ key: 'HallwayScene' });
        this.playerContainer = null;
        this.targetPos = null;
        this.doors = [];
        this.enterButton = null;
        this.activeDoor = null;
      }

      preload() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x87CEFA, 1); g.fillRoundedRect(0, 0, 60, 90, 8);
        g.fillStyle(0xFFFFFF, 0.8); g.fillRect(10, 10, 40, 30);
        g.fillStyle(0xFFA500, 1); g.fillCircle(50, 50, 4);
        g.generateTexture('cute-door', 60, 90); g.clear();

        g.fillStyle(0xCD853F, 1); g.fillRoundedRect(0, 0, 80, 100, 8);
        g.fillStyle(0xFFFFFF, 0.6); g.fillRect(15, 15, 50, 40);
        g.generateTexture('office-door', 80, 100); g.clear();

        g.fillStyle(0xDEB887, 1); g.fillRect(0, 0, 80, 50); g.fillStyle(0xFFFFFF, 1); g.fillRect(10, 10, 20, 25);
        g.generateTexture('board', 80, 50); g.clear();
        g.fillStyle(0x9CA3AF, 1); g.fillRect(0, 0, 60, 70); g.lineStyle(2, 0x4B5563, 1); g.strokeRect(0, 0, 20, 70);
        g.generateTexture('lockers', 60, 70); g.clear();
        g.fillStyle(0xEF4444, 1); g.fillRoundedRect(0, 0, 20, 30, 4);
        g.generateTexture('fire-ext', 20, 35); g.clear();
        g.fillStyle(0x9CA3AF, 1); g.fillRect(0, 0, 120, 120);
        g.generateTexture('stairs', 120, 120); g.clear();
      }

      create() {
        const halfCount = 7;
        const hallwayWidth = halfCount * 220 + 450;
        const hallwayHeight = 650;
        this.physics.world.setBounds(0, 0, hallwayWidth, hallwayHeight);

        const topWallY = 140;
        const bottomWallY = 510;

        this.add.rectangle(hallwayWidth / 2, topWallY / 2, hallwayWidth, topWallY, 0xE0FFFF);
        this.add.rectangle(hallwayWidth / 2, bottomWallY + (hallwayHeight - bottomWallY) / 2, hallwayWidth, hallwayHeight - bottomWallY, 0xE0FFFF);
        
        const topWall = this.add.rectangle(hallwayWidth / 2, topWallY / 2, hallwayWidth, topWallY, 0x000000, 0);
        this.physics.add.existing(topWall, true);
        const bottomWall = this.add.rectangle(hallwayWidth / 2, bottomWallY + (hallwayHeight - bottomWallY) / 2, hallwayWidth, hallwayHeight - bottomWallY, 0x000000, 0);
        this.physics.add.existing(bottomWall, true);

        this.add.image(140, topWallY - 5, 'office-door').setOrigin(0.5, 1);
        this.add.text(140, topWallY - 120, `교무실`, { fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#333', backgroundColor: '#fff', padding: 3 }).setOrigin(0.5);

        this.doors = [];

        for (let i = 1; i <= 14; i++) {
          let xPos, yPos, doorImg;
          if (i <= 7) {
            xPos = 320 + (i - 1) * 220;
            yPos = topWallY - 5;
            doorImg = this.add.image(xPos, yPos, 'cute-door').setOrigin(0.5, 1);
            this.add.text(xPos, topWallY - 110, `${i}반`, { fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#333', backgroundColor: '#fff', padding: 2 }).setOrigin(0.5);
            this.add.image(xPos + 70, topWallY - 5, 'lockers').setOrigin(0.5, 1);
            if (i % 2 === 0) this.add.image(xPos + 110, topWallY - 60, 'board');
            if (i % 3 === 0) this.add.image(xPos + 140, topWallY - 5, 'fire-ext').setOrigin(0.5, 1);
          } else {
            const idx = i - 7;
            xPos = 320 + (idx - 1) * 220;
            yPos = bottomWallY + 5;
            doorImg = this.add.image(xPos, yPos, 'cute-door').setOrigin(0.5, 0);
            this.add.text(xPos, bottomWallY + 110, `${i}반`, { fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#333', backgroundColor: '#fff', padding: 2 }).setOrigin(0.5);
            this.add.image(xPos + 70, bottomWallY + 5, 'lockers').setOrigin(0.5, 0);
            if (i % 2 === 0) this.add.image(xPos + 110, bottomWallY + 60, 'board');
            if (i % 3 === 0) this.add.image(xPos + 140, bottomWallY + 5, 'fire-ext').setOrigin(0.5, 0);
          }
          this.doors.push({ id: i, name: `${i}반`, x: xPos, y: i <= 7 ? yPos - 45 : yPos + 45 });
        }

        const stairX = hallwayWidth - 100;
        const stairY = (topWallY + bottomWallY) / 2;
        this.add.image(stairX, stairY, 'stairs').setOrigin(0.5, 0.5);

        // [입장하기] 버튼 생성
        this.enterButton = this.add.text(0, 0, '🚪 입장하기', {
          fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold',
          color: '#ffffff', backgroundColor: '#ff1493', padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setInteractive().setScrollFactor(1).setDepth(100).setVisible(false);

        this.enterButton.on('pointerdown', () => {
          if (this.activeDoor) {
            this.targetPos = null;
            this.scene.start('ClassroomScene', { className: this.activeDoor.name });
          }
        });

        // 🚀 아바타 3단 렌더링 복구 (옷 -> 헤어 -> 모자)
        this.playerContainer = this.add.container(250, 320);
        this.playerContainer.setSize(32, 40);
        this.physics.world.enable(this.playerContainer);
        
        const clothesIcon = dbUser?.equipped?.clothes?.icon || '👕';
        const clothesText = this.add.text(0, 12, clothesIcon, { fontSize: '32px' }).setOrigin(0.5);
        
        const hairIcon = dbUser?.equipped?.hair?.icon || '🧑';
        const hairText = this.add.text(0, -12, hairIcon, { fontSize: '32px' }).setOrigin(0.5);
        
        const hatIcon = dbUser?.equipped?.hat?.icon || ''; 
        const hatText = this.add.text(0, -22, hatIcon, { fontSize: '32px' }).setOrigin(0.5);
        
        const nameTagBg = this.add.rectangle(0, -50, 60, 18, 0xFFFFFF, 0.8).setOrigin(0.5);
        const nameTag = this.add.text(0, -50, dbUser?.name || '학생', { fontFamily: 'sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#333' }).setOrigin(0.5);
        
        this.playerContainer.add([clothesText, hairText, hatText, nameTagBg, nameTag]);
        this.playerContainer.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.playerContainer, topWall);
        this.physics.add.collider(this.playerContainer, bottomWall);
        
        this.cameras.main.startFollow(this.playerContainer, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, hallwayWidth, hallwayHeight);

        this.input.on('pointerdown', (pointer) => {
          if (pointer.y < 80 && pointer.x < 180) return; // UI 영역(옷방버튼) 터치 무시
          this.targetPos = { x: pointer.worldX, y: pointer.worldY };
          const marker = this.add.circle(pointer.worldX, pointer.worldY, 6, 0xFF69B4);
          this.tweens.add({ targets: marker, scale: 2.5, alpha: 0, duration: 400, onComplete: () => marker.destroy() });
        });
      }

      update() {
        if (!this.playerContainer.body) return;
        const speed = 240;

        let nearDoor = null;
        this.doors.forEach(door => {
          const dist = Phaser.Math.Distance.Between(this.playerContainer.x, this.playerContainer.y, door.x, door.y);
          if (dist < 75) { nearDoor = door; } 
        });

        if (nearDoor) {
          this.activeDoor = nearDoor;
          this.enterButton.setPosition(nearDoor.x, nearDoor.y + (nearDoor.id <= 7 ? 65 : -65));
          this.enterButton.setVisible(true);
        } else {
          this.enterButton.setVisible(false);
          this.activeDoor = null;
        }

        if (this.targetPos) {
          const dx = this.targetPos.x - this.playerContainer.x;
          const dy = this.targetPos.y - this.playerContainer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 5) {
            const angle = Math.atan2(dy, dx);
            this.playerContainer.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
          } else {
            this.playerContainer.body.setVelocity(0);
            this.targetPos = null;
          }
        } else {
          this.playerContainer.body.setVelocity(0);
        }
      }
    }

    // ==========================================
    // 🪑 씬 2: 교실 내부 인테리어 화면 (ClassroomScene)
    // ==========================================
    class ClassroomScene extends Phaser.Scene {
      constructor() {
        super({ key: 'ClassroomScene' });
        this.className = '';
        this.playerContainer = null;
        this.targetPos = null;
      }

      init(data) {
        this.className = data.className || '교실';
      }

      preload() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xDEB887, 1); g.fillRect(5, 0, 40, 25);
        g.fillStyle(0xA0522D, 1); g.fillRect(13, 28, 24, 18);
        g.generateTexture('desk-set', 50, 50); g.clear();

        g.fillStyle(0x8B4513, 1); g.fillRoundedRect(0, 0, 90, 45, 4);
        g.fillStyle(0xFFD700, 1); g.fillRect(35, 5, 20, 5); 
        g.generateTexture('teacher-desk', 90, 45); g.clear();
      }

      create() {
        const roomW = 900;
        const roomH = 750;
        this.physics.world.setBounds(0, 0, roomW, roomH);
        this.cameras.main.setBackgroundColor('#FFF5EE'); 

        this.add.rectangle(roomW / 2, 40, 500, 20, 0x14532d);
        this.add.text(roomW / 2, 40, '💡 바르고 슬기롭게', { fontFamily: 'sans-serif', fontSize: '11px', color: '#fff' }).setOrigin(0.5);

        this.add.image(roomW / 2, 110, 'teacher-desk');
        this.add.text(roomW / 2, 110, '교탁', { fontFamily: 'sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);

        const startX = 180; const startY = 220;
        const spacingX = 110; const spacingY = 80;

        for (let row = 0; row < 6; row++) {
          for (let col = 0; col < 6; col++) {
            this.add.image(startX + col * spacingX, startY + row * spacingY, 'desk-set');
          }
        }

        const exitBtn = this.add.text(50, 40, '⬅ 복도로 나가기', {
          fontFamily: 'sans-serif', fontSize: '13px', fontStyle: 'bold',
          color: '#333', backgroundColor: '#e2e8f0', padding: { x: 12, y: 8 }
        }).setInteractive();
        
        exitBtn.on('pointerdown', () => {
          this.targetPos = null;
          this.scene.start('HallwayScene');
        });

        this.add.text(roomW - 150, 45, `📍 현재 위치: ${this.className}`, {
          fontFamily: 'sans-serif', fontSize: '15px', fontStyle: 'bold',
          color: '#fff', backgroundColor: '#1e293b', padding: { x: 12, y: 6 }
        }).setOrigin(0.5);

        // 🚀 교실 내부 아바타 3단 렌더링 복구
        this.playerContainer = this.add.container(roomW / 2, roomH - 60);
        this.playerContainer.setSize(32, 40);
        this.physics.world.enable(this.playerContainer);

        const clothesIcon = dbUser?.equipped?.clothes?.icon || '👕';
        const clothesText = this.add.text(0, 12, clothesIcon, { fontSize: '32px' }).setOrigin(0.5);
        
        const hairIcon = dbUser?.equipped?.hair?.icon || '🧑';
        const hairText = this.add.text(0, -12, hairIcon, { fontSize: '32px' }).setOrigin(0.5);
        
        const hatIcon = dbUser?.equipped?.hat?.icon || ''; 
        const hatText = this.add.text(0, -22, hatIcon, { fontSize: '32px' }).setOrigin(0.5);
        
        const nameTagBg = this.add.rectangle(0, -50, 60, 18, 0xFFFFFF, 0.8).setOrigin(0.5);
        const nameTag = this.add.text(0, -50, dbUser?.name || '학생', { fontFamily: 'sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#333' }).setOrigin(0.5);

        this.playerContainer.add([clothesText, hairText, hatText, nameTagBg, nameTag]);
        this.playerContainer.body.setCollideWorldBounds(true);

        this.cameras.main.startFollow(this.playerContainer, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, roomW, roomH);

        this.input.on('pointerdown', (pointer) => {
          if (pointer.y < 80 && pointer.x < 180) return; 
          this.targetPos = { x: pointer.worldX, y: pointer.worldY };
          const marker = this.add.circle(pointer.worldX, pointer.worldY, 6, 0x3b82f6);
          this.tweens.add({ targets: marker, scale: 2.5, alpha: 0, duration: 400, onComplete: () => marker.destroy() });
        });
      }

      update() {
        if (!this.playerContainer.body) return;
        const speed = 220;

        if (this.targetPos) {
          const dx = this.targetPos.x - this.playerContainer.x;
          const dy = this.targetPos.y - this.playerContainer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 5) {
            const angle = Math.atan2(dy, dx);
            this.playerContainer.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
          } else {
            this.playerContainer.body.setVelocity(0);
            this.targetPos = null;
          }
        } else {
          this.playerContainer.body.setVelocity(0);
        }
      }
    }

    const config = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: gameRef.current,
      backgroundColor: '#FFF8DC',
      physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
      scene: [HallwayScene, ClassroomScene], 
      scale: { mode: Phaser.Scale.RESIZE }
    };

    const game = new Phaser.Game(config);
    setIsReady(true);

    return () => { game.destroy(true); };
  }, [dbUser]);

  return (
    <div className="w-full h-full relative bg-[#FFF8DC]">
      <div ref={gameRef} className="w-full h-full" />
      
      {/* 🚀 누락되었던 HTML UI 옷방 버튼 및 안내 텍스트 완벽 복구 */}
      {isReady && (
        <div className="absolute top-4 left-4 pointer-events-none z-10">
          <div className="bg-white/90 px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <span className="font-black text-gray-800 text-sm mb-1">🏫 학교 광장 & 교실</span>
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