// ============================================================
// ลูกเล่นสุ่มเมนูอาหารหลังตีแบต — 6 เมนู สุ่มตามโอกาสที่กำหนด
// กดปุ่มสุ่มเมนูบน HUD เอง (ไม่เด้งอัตโนมัติหลังบันทึกผล)
// ภาพเมนูเป็นพิกเซล 8-บิต วาดใน src/components/pixel-food.tsx
// ============================================================

export type FoodMenuId = 'congee' | 'shabu' | 'steak' | 'sushi' | 'somtam' | 'iron';

export interface FoodMenu {
  id: FoodMenuId;
  dish: string; // ชื่อเมนู
  shop: string; // ชื่อร้าน
  chance: number; // โอกาสถูกสุ่ม (%)
  accent: string; // สีประจำเมนู (badge/dot)
  tagline: string; // มุกสั้น ๆ ตอนรู้ผล
}

export const FOOD_MENUS: FoodMenu[] = [
  {
    id: 'congee',
    dish: 'ข้าวต้ม',
    shop: 'ข้างทาง',
    chance: 45,
    accent: '#5b8fd6',
    tagline: 'ปลอดภัย อิ่มจริง ไปได้ทุกงาน',
  },
  {
    id: 'shabu',
    dish: 'ชาบู',
    shop: 'ชาใจ',
    chance: 15,
    accent: '#e04b3a',
    tagline: 'นั่งจิบน้ำซุปกันจนหิวตีรอบใหม่',
  },
  {
    id: 'steak',
    dish: 'สเต็ก',
    shop: 'ลุงวอ',
    chance: 15,
    accent: '#a0522d',
    tagline: 'หรูหราขึ้นเยอะ แต่ยังจิ้มแจ่วได้',
  },
  {
    id: 'sushi',
    dish: 'ซูชิ',
    shop: 'ปิ๊แมว',
    chance: 10,
    accent: '#ff8c42',
    tagline: 'เหมียวรับรอง ปลาสดทุกเม็ด',
  },
  {
    id: 'somtam',
    dish: 'ส้มตำ',
    shop: 'ระยำใจ',
    chance: 10,
    accent: '#7bc043',
    tagline: 'เผ็ดจนลืมว่าวันนี้แพ้หรือชนะ',
  },
  {
    id: 'iron',
    dish: 'IRON GRILL',
    shop: 'ริวจิตสัมผัส',
    chance: 5,
    accent: '#ff9d2e',
    tagline: 'แกร่งเหมือนเตารีด หอมทะลุจอ',
  },
];

// สุ่มเมนูตามโอกาส (รวมทุกเมนู = 100%)
export function pickFoodMenu(): FoodMenu {
  const roll = Math.random() * 100;
  let acc = 0;
  for (const menu of FOOD_MENUS) {
    acc += menu.chance;
    if (roll < acc) return menu;
  }
  return FOOD_MENUS[FOOD_MENUS.length - 1]; // กันเหนียวเผื่อ float
}
