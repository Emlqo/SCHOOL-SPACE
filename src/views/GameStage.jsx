import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

export default function GameStage({ dbUser }) {
  const gameRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 💡 React StrictMode에서 캔버스가 두 번 생기는 것을 방지
    if (gameRef.current.children.length > 0) return;

    const config = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: gameRef.current,
      backgroundColor: '#FFF8DC', // 따뜻하고 밝은 상아색 바닥
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false } // 탑다운 뷰이므로 중력 0
      },
      scene: { preload, create, update },
      scale: { mode: Phaser.Scale.RESIZE } // 창 크기에 자동 맞춤
    };

    const game = new Phaser.Game(config);
    let playerContainer;
    let cursors;
    let wasd;

    // ==========================================
    // 1. 에셋 준비 (코드로 직접 귀여운 그래픽 그리기)
    // ==========================================
    function preload() {
      const g = this.make.graphics({ x: 0, y: 0, add: false });

      // 👤 귀여운 플레이어 캐릭터 (핑크색 동그라미에 눈 콕콕)
      g.fillStyle(0xFFB6C1, 1); 
      g.fillCircle(16, 16, 16); // 몸통
      g.fillStyle(0x333333, 1); 
      g.fillCircle(10, 12, 2);  // 왼쪽 눈
      g.fillCircle(22, 12, 2);  // 오른쪽 눈
      g.generateTexture('cute-player', 32, 32);
      g.clear();

      // 🚪 파스텔 톤 교실 문
      g.fillStyle(0x87CEFA, 1); // 밝은 하늘색
      g.fillRoundedRect(0, 0, 60, 90, 8); // 둥근 네모
      g.fillStyle(0xFFFFFF, 0.8);
      g.fillRect(10, 10, 40, 30); // 유리창
      g.fillStyle(0xFFA500, 1);
      g.fillCircle(50, 50, 4); // 손잡이
      g.generateTexture('cute-door', 60, 90);
      g.clear();

      // 🟩 게시판
      g.fillStyle(0xDEB887, 1);
      g.fillRect(0, 0, 80, 50);
      g.fillStyle(0xFFFFFF, 1);
      g.fillRect(10, 10, 20, 25); // 종이 1
      g.fillStyle(0xFFFFF0, 1);
      g.fillRect(40, 15, 30, 20); // 종이 2
      g.generateTexture('board', 80, 50);
    }

    // ==========================================
    // 2. 맵과 캐릭터 배치 (Create)
    // ==========================================
    function create() {
      const classesCount = 14;
      const hallwayWidth = classesCount * 180 + 200; // 14개 반 크기에 맞춘 복도 길이
      const hallwayHeight = 800;

      // 카메라가 이동할 수 있는 전체 맵 크기 지정
      this.physics.world.setBounds(0, 0, hallwayWidth, hallwayHeight);

      // 윗부분 벽지 (파스텔 민트색)
      const wallHeight = 150;
      this.add.rectangle(hallwayWidth / 2, wallHeight / 2, hallwayWidth, wallHeight, 0xE0FFFF);
      
      // 위쪽 벽에 보이지 않는 충돌 블록 설치 (캐릭터가 벽 위로 못 넘어가게)
      const topWall = this.add.rectangle(hallwayWidth / 2, wallHeight / 2, hallwayWidth, wallHeight, 0x000000, 0);
      this.physics.add.existing(topWall, true); // true = static (움직이지 않는 벽)

      // 🏫 1반 ~ 14반 배치
      for (let i = 1; i <= classesCount; i++) {
        const xPos = 100 + i * 160;
        
        // 문 추가
        this.add.image(xPos, wallHeight - 5, 'cute-door').setOrigin(0.5, 1);
        
        // 문 위 동글동글 귀여운 간판
        const signBg = this.add.rectangle(xPos, wallHeight - 110, 50, 24, 0xFFFFFF).setStrokeStyle(2, 0x333333);
        signBg.isStroked = true;
        this.add.text(xPos, wallHeight - 110, `${i}반`, {
          fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#333'
        }).setOrigin(0.5);

        // 반 사이에 게시판 추가 (짝수 반마다)
        if (i % 2 === 0) {
          this.add.image(xPos - 80, wallHeight - 40, 'board');
        }
      }

      // 👤 플레이어 컨테이너 생성 (캐릭터 몸통 + 이름표 텍스트 묶음)
      playerContainer = this.add.container(200, 300);
      playerContainer.setSize(32, 32);
      this.physics.world.enable(playerContainer); // 컨테이너에 물리 엔진 적용
      
      const body = this.add.image(0, 0, 'cute-player');
      const nameTagBg = this.add.rectangle(0, -28, 60, 18, 0xFFFFFF, 0.8).setOrigin(0.5);
      const nameTag = this.add.text(0, -28, dbUser?.name || '학생', { 
        fontFamily: 'sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#333' 
      }).setOrigin(0.5);
      
      playerContainer.add([body, nameTagBg, nameTag]);
      playerContainer.body.setCollideWorldBounds(true); // 맵 밖으로 안 나가게
      
      // 플레이어와 위쪽 벽의 충돌 설정
      this.physics.add.collider(playerContainer, topWall);

      // 🎥 카메라가 플레이어를 부드럽게 따라다니도록 설정
      this.cameras.main.startFollow(playerContainer, true, 0.08, 0.08);
      this.cameras.main.setBounds(0, 0, hallwayWidth, hallwayHeight);

      // ⌨️ 키보드 입력 설정
      cursors = this.input.keyboard.createCursorKeys();
      wasd = this.input.keyboard.addKeys('W,S,A,D');

      setIsReady(true);
    }

    // ==========================================
    // 3. 매 프레임 업데이트 (이동 로직)
    // ==========================================
    function update() {
      if (!playerContainer.body) return;

      const speed = 250;
      playerContainer.body.setVelocity(0); // 매 프레임 속도 초기화

      // 좌우 이동
      if (cursors.left.isDown || wasd.A.isDown) {
        playerContainer.body.setVelocityX(-speed);
      } else if (cursors.right.isDown || wasd.D.isDown) {
        playerContainer.body.setVelocityX(speed);
      }

      // 상하 이동
      if (cursors.up.isDown || wasd.W.isDown) {
        playerContainer.body.setVelocityY(-speed);
      } else if (cursors.down.isDown || wasd.S.isDown) {
        playerContainer.body.setVelocityY(speed);
      }
    }

    // 컴포넌트가 꺼질 때 Phaser 엔진 정리
    return () => {
      game.destroy(true);
    };
  }, [dbUser]);

  return (
    <div className="w-full h-full relative bg-[#FFF8DC]">
      {/* Phaser 게임이 그려질 도화지 */}
      <div ref={gameRef} className="w-full h-full" />
      
      {/* 게임 위에 떠있는 HTML UI 오버레이 */}
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