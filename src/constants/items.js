export const SHOP_ITEMS = {
  furniture: [
    { id: 'f001', name: '나무 책상', type: 'furniture', icon: '🪑', price: 100 },
    { id: 'f002', name: '편안한 소파', type: 'furniture', icon: '🛋️', price: 250 },
    { id: 'f003', name: '사무용 의자', type: 'furniture', icon: '💺', price: 120 },
    { id: 'f004', name: '전신 거울', type: 'furniture', icon: '🪞', price: 150 },
    { id: 'f005', name: '책꽂이', type: 'furniture', icon: '📚', price: 200 },
  ],
  // 🚀 💇 헤어스타일 목록 대폭 추가
  hair: [
    { id: 'h001', name: '단정한 갈색 머리', type: 'hair', icon: '💇', price: 100 },
    { id: 'h002', name: '긴 웨이브 머리', type: 'hair', icon: '👱‍♀️', price: 150 },
    { id: 'h003', name: '검은색 단발 머리', type: 'hair', icon: '👩🏿', price: 120 },
    { id: 'h004', name: '뽀글뽀글 파마 머리', type: 'hair', icon: '👨🏾‍🦱', price: 130 },
    { id: 'h005', name: '귀여운 양갈래 머리', type: 'hair', icon: '👧', price: 140 },
    { id: 'h006', name: '금발 포니테일', type: 'hair', icon: '👱', price: 160 },
    { id: 'h007', name: '깔끔한 상투 머리', type: 'hair', icon: '🧔', price: 110 },
    { id: 'h008', name: '사이버펑크 네온 머리', type: 'hair', icon: '🧑🏽‍🎤', price: 180 },
  ],
  // 🚀 👕 옷/의상 목록 대폭 추가
  clothes: [
    { id: 'c001', name: '초록색 후드', type: 'clothes', icon: '👕', price: 200 },
    { id: 'c002', name: '선생님 정장', type: 'clothes', icon: '👔', price: 300 },
    { id: 'c003', name: '핑크색 원피스', type: 'clothes', icon: '👗', price: 250 },
    { id: 'c004', name: '교복 셔츠', type: 'clothes', icon: '👔', price: 180 },
    { id: 'c005', name: '트레이닝 복', type: 'clothes', icon: '🎽', price: 220 },
    { id: 'c006', name: '알록달록 스웨터', type: 'clothes', icon: '🧶', price: 230 },
    { id: 'c007', name: '럭셔리 코트', type: 'clothes', icon: '🧥', price: 400 },
    { id: 'c008', name: '귀여운 잠옷', type: 'clothes', icon: '👘', price: 190 },
  ],
  // 🚀 🧢 모자/액세서리 목록 대폭 추가 (새로운 카테고리!)
  hat: [
    { id: 'hat001', name: '파란 야구 모자', type: 'hat', icon: '🧢', price: 80 }, // 문제의 폴터가이스트 범인!
    { id: 'hat002', name: '멋쟁이 카우보이 모자', type: 'hat', icon: '🤠', price: 120 },
    { id: 'hat003', name: '귀여운 파티 모자', type: 'hat', icon: '🥳', price: 70 },
    { id: 'hat004', name: '수줍은 밀짚 모자', type: 'hat', icon: '👒', price: 90 },
    { id: 'hat005', name: '따뜻한 털모자', type: 'hat', icon: '🕵️', price: 100 },
    { id: 'hat006', name: '왕관 (임금님)', type: 'hat', icon: '👑', price: 1000 },
  ]
};

export const ALL_ITEMS = [
  ...SHOP_ITEMS.furniture,
  ...SHOP_ITEMS.hair,
  ...SHOP_ITEMS.clothes,
  ...SHOP_ITEMS.hat,
];