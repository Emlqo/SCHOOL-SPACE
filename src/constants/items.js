export const SHOP_ITEMS = {
  furniture: [
    { id: 'f_desk_1', name: '나무 책상', price: 100, icon: '🪑', type: 'furniture' },
    // 🚀 누워있는 사람(🛌)을 쫓아내고 빈 침대(🛏️)로 변경했습니다!
    { id: 'f_bed_1', name: '포근한 침대', price: 300, icon: '🛏️', type: 'furniture' }, 
    { id: 'f_plant_1', name: '작은 화분', price: 50, icon: '🪴', type: 'furniture' },
    { id: 'f_lamp_1', name: '스탠드 조명', price: 150, icon: '💡', type: 'furniture' },
    { id: 'f_tv_1', name: '벽걸이 TV', price: 500, icon: '📺', type: 'furniture' },
    { id: 'f_sofa_1', name: '편안한 소파', price: 250, icon: '🛋️', type: 'furniture' },
    { id: 'f_mirror_1', name: '전신 거울', price: 150, icon: '🪞', type: 'furniture' },
  ],
  hair: [
    { id: 'h_short_1', name: '단정 숏컷', price: 200, icon: '👦', type: 'hair' },
    { id: 'h_long_1', name: '긴 생머리', price: 200, icon: '👩', type: 'hair' },
    { id: 'h001', name: '단정한 갈색 머리', type: 'hair', icon: '💇', price: 100 },
    { id: 'h002', name: '긴 웨이브 머리', type: 'hair', icon: '👱‍♀️', price: 150 },
    { id: 'h003', name: '검은색 단발 머리', type: 'hair', icon: '👩🏿', price: 120 },
    { id: 'h004', name: '뽀글뽀글 파마 머리', type: 'hair', icon: '👨🏾‍🦱', price: 130 },
    { id: 'h005', name: '귀여운 양갈래 머리', type: 'hair', icon: '👧', price: 140 },
  ],
  clothes: [
    { id: 'c_school_1', name: '춘추 교복', price: 300, icon: '👔', type: 'clothes' },
    { id: 'c_casual_1', name: '편한 후드티', price: 250, icon: '🧥', type: 'clothes' },
    { id: 'c_sport_1', name: '체육복', price: 200, icon: '🎽', type: 'clothes' },
    { id: 'c001', name: '초록색 후드', type: 'clothes', icon: '👕', price: 200 },
    { id: 'c003', name: '핑크색 원피스', type: 'clothes', icon: '👗', price: 250 },
    { id: 'c008', name: '귀여운 잠옷', type: 'clothes', icon: '👘', price: 190 },
  ],
  hat: [
    { id: 'h_cap_1', name: '야구 모자', price: 150, icon: '🧢', type: 'hat' },
    { id: 'hat002', name: '카우보이 모자', type: 'hat', icon: '🤠', price: 120 },
    { id: 'hat003', name: '파티 모자', type: 'hat', icon: '🥳', price: 70 },
    { id: 'hat006', name: '임금님 왕관', type: 'hat', icon: '👑', price: 1000 },
  ]
};

export const ALL_ITEMS = [
  ...SHOP_ITEMS.furniture,
  ...SHOP_ITEMS.hair,
  ...SHOP_ITEMS.clothes,
  ...SHOP_ITEMS.hat,
];