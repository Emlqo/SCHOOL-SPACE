import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

export default function GameStage({ dbUser }) {
  const gameRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (gameRef.current.children.length > 0) return;

    const config = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: gameRef.current,
      backgroundColor: '#FFF8DC',
      physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
      scene: { preload, create, update },
      scale: { mode: Phaser.Scale.RESIZE }
    };

    const game = new Phaser.Game(config);
    let playerContainer;
    let cursors;
    let wasd;

    function preload() {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      
      // 파스텔 톤 교실 문
      g.fillStyle(0x87CEFA, 1);
      g.fillRoundedRect(0, 0, 60, 90, 8);
      g.fillStyle(0xFFFFFF, 0.8);
      g.fillRect(10, 10, 40, 30);
      g.fillStyle(0xFFA500, 1);
      g.fillCircle(50, 50, 4);
      g.generateTexture('cute-door', 60, 90);
      g.clear();

      // 게시판
      g.fillStyle(0xDEB887, 1);
      g.fillRect(0, 0, 80, 50);
      g.fillStyle(0xFFFFFF, 1);
      g.fillRect(10, 10, 20, 25);
      g.fillStyle(0xFFFFF0, 1);
      g.fillRect(40, 15, 30, 20);
      g.generateTexture('board', 80, 50);
    }

    function create() {
      const classesCount = 14;
      const hallwayWidth = classesCount * 180 + 200;
      const hallwayHeight = 800;

      this.physics.world.setBounds(0, 0, hallwayWidth, hallwayHeight);
      const wallHeight = 150;
      this.add.rectangle(hallwayWidth / 2, wallHeight / 2, hallwayWidth, wallHeight, 0xE0FFFF);
      const topWall = this.add.rectangle(hallwayWidth / 2, wallHeight / 2, hallwayWidth, wallHeight, 0x000000, 0);
      this.physics.add.existing(topWall, true);

      for (let i = 1; i <= classesCount; i++) {
        const xPos = 100 + i * 160;
        this.add.image(xPos, wallHeight - 5, 'cute-door').setOrigin(0.5, 1);
        const signBg = this.add.rectangle(xPos, wallHeight - 110, 50, 24, 0xFFFFFF).setStrokeStyle(2, 0x333333);
        signBg.isStroked = true;
        this.add.text(xPos, wallHeight - 110, `${i}반`, { fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#333' }).setOrigin(0.5);
        if (i % 2 === 0) this.add.image(xPos - 80, wallHeight - 40, 'board');
      }

   // 🚀 실제 아이템 착용 정보 렌더링 (수정된 부분)
      playerContainer = this.add.container(200, 300);
      playerContainer.setSize(32, 32);
      this.physics.world.enable(playerContainer);
      
      // 1. 착용한 헤어 (머리 및 얼굴 역할, Y축을 위로)
      const hairIcon = dbUser?.equipped?.hair?.icon || '🧑';
      const hairText = this.add.text(0, -12, hairIcon, { fontSize: '32px' }).setOrigin(0.5);
      
      // 2. 착용한 옷 (몸통 역할, Y축을 아래로)
      const clothesIcon = dbUser?.equipped?.clothes?.icon || '👕';
      const clothesText = this.add.text(0, 12, clothesIcon, { fontSize: '32px' }).setOrigin(0.5);
      
      const nameTagBg = this.add.rectangle(0, -40, 60, 18, 0xFFFFFF, 0.8).setOrigin(0.5);
      const nameTag = this.add.text(0, -40, dbUser?.name || '학생', { fontFamily: 'sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#333' }).setOrigin(0.5);
      
      // 컨테이너에 담기 (옷을 먼저, 머리를 나중에 담아야 자연스러움)
      playerContainer.add([clothesText, hairText, nameTagBg, nameTag]);
      playerContainer.body.setCollideWorldBounds(true);
      this.physics.add.collider(playerContainer, topWall);
      this.cameras.main.startFollow(playerContainer, true, 0.08, 0.08);
      this.cameras.main.setBounds(0, 0, hallwayWidth, hallwayHeight);

      cursors = this.input.keyboard.createCursorKeys();
      wasd = this.input.keyboard.addKeys('W,S,A,D');
      setIsReady(true);
    }

    function update() {
      if (!playerContainer.body) return;
      const speed = 250;
      playerContainer.body.setVelocity(0);

      if (cursors.left.isDown || wasd.A.isDown) playerContainer.body.setVelocityX(-speed);
      else if (cursors.right.isDown || wasd.D.isDown) playerContainer.body.setVelocityX(speed);

      if (cursors.up.isDown || wasd.W.isDown) playerContainer.body.setVelocityY(-speed);
      else if (cursors.down.isDown || wasd.S.isDown) playerContainer.body.setVelocityY(speed);
    }

    return () => { game.destroy(true); };
  }, [dbUser]);

  return (
    <div className="w-full h-full relative bg-[#FFF8DC]">
      <div ref={gameRef} className="w-full h-full" />
      {isReady && (
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="bg-white/90 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <span className="font-black text-gray-800 text-sm mb-1">🏫 귀여운 2D 학교 복도</span>
            <span className="text-xs text-gray-500 font-bold">W, A, S, D 또는 방향키로 이동하세요!</span>
          </div>
        </div>
      )}
    </div>
  );
}