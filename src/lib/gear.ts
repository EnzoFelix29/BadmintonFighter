// ============================================================
// ระบบสกินอุปกรณ์ 8-bit — ไม้แบดและรองเท้าแบด
// ไม้แบด 30 สกิน (เลือกฟรี 20 + ร้านค้าสกินเท่ห์ 10)
// รองเท้าแบด 30 สกิน (เลือกฟรี 20 + ร้านค้าสกินเท่ห์ 10)
// สกินร้านค้าราคา 100 เหรียญ/สกิน — เก็บเหรียญ: ชนะ +3 / แพ้ +1
// อักษรแพทเทิร์น:
//   ไม้แบด: F กรอบหัวไม้  G เส้นเชือก  H สันไม้  P จับไม้
//   รองเท้า: B ตัวรองเท้า  D ลายข้าง  L เชือกรองเท้า  W พื้นรองเท้า
// ============================================================
import { shade } from './characters';

export type GearKind = 'racket' | 'shoe';
export type GearShape = 'oval' | 'wide' | 'tear' | 'sneaker' | 'hightop';

export interface GearSkin {
  id: string;
  name: string;
  kind: GearKind;
  shape: GearShape;
  price: number; // 0 = เลือกได้ฟรีทันที, 100 = ต้องปลดล็อคที่ร้านค้า
  primary: string; // กรอบหัวไม้ / ตัวรองเท้า
  string: string; // เส้นเชือกในหัวไม้ / เชือกรองเท้า
  accent: string; // จับไม้ / พื้นรองเท้า
  detail: string; // ลายข้างรองเท้า
}

export const SHOP_PRICE = 100;

// ---------- แพทเทิร์นไม้แบด (12x14) ----------
export const RACKET_PATTERNS: Record<'oval' | 'wide' | 'tear', string[]> = {
  oval: [
    '....FFFF....',
    '..FFGGGGFF..',
    '.FFGGGGGGFF.',
    '.FGGGGGGGGF.',
    '.FGGGGGGGGF.',
    '.FFGGGGGGFF.',
    '..FFGGGGFF..',
    '...FFFFFF...',
    '.....HH.....',
    '.....HH.....',
    '.....HH.....',
    '....PPPP....',
    '....PPPP....',
    '....PPPP....',
  ],
  wide: [
    '..FFFFFFFF..',
    '.FGGGGGGGGF.',
    '.FGGGGGGGGF.',
    '.FGGGGGGGGF.',
    '.FGGGGGGGGF.',
    '.FGGGGGGGGF.',
    '.FGGGGGGGGF.',
    '..FFFFFFFF..',
    '.....HH.....',
    '.....HH.....',
    '.....HH.....',
    '....PPPP....',
    '....PPPP....',
    '....PPPP....',
  ],
  tear: [
    '.....FF.....',
    '....FGGF....',
    '...FGGGGF...',
    '...FGGGGF...',
    '..FGGGGGGF..',
    '..FGGGGGGF..',
    '.FGGGGGGGGF.',
    '.FFFFHHFFFF.',
    '.....HH.....',
    '.....HH.....',
    '.....HH.....',
    '....PPPP....',
    '....PPPP....',
    '....PPPP....',
  ],
};

// ---------- แพทเทิร์นรองเท้า (12x14 — หัวปลายไปทางขวา) ----------
// B ตัวรองเท้า  D ส้น/ลายข้าง  T ลิ้นรองเท้า  L เชือก  W พื้นรองเท้า
export const SHOE_PATTERNS: Record<'sneaker' | 'hightop', string[]> = {
  sneaker: [
    '............',
    '..BBB.......',
    '..BBBB......',
    '..BBBTB.....',
    '..BBBTLB....',
    '.BBBBTLLB...',
    '.BBBBBLLLBB.',
    '.DBBBBBLLLLB',
    'BDBBBBBBBBBB',
    'BBBBBBBBBBBB',
    'WWWWWWWWWWWW',
    'WWWWWWWWWWWW',
    '.WWWWWWWWWW.',
    '............',
  ],
  hightop: [
    '..BBB.......',
    '..BBB.......',
    '..BBBB......',
    '..BBBTB.....',
    '..BBBTLB....',
    '.BBBBTLLB...',
    '.BBBBBLLLBB.',
    '.DBBBBBLLLLB',
    'BDBBBBBBBBBB',
    'BBBBBBBBBBBB',
    'BBBBBBBBBBBB',
    'WWWWWWWWWWWW',
    'WWWWWWWWWWWW',
    '.WWWWWWWWWW.',
  ],
};

// ---------- สกินไม้แบดฟรี 20 แบบ ----------
const RACKET_SHAPES: GearShape[] = ['oval', 'wide', 'tear'];
const GRIPS = ['#78350f', '#27272a', '#1e293b'];

const FREE_RACKET_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#f97316', '#8b5cf6',
  '#14b8a6', '#ec4899', '#1f2937', '#eab308', '#0ea5e9',
  '#84cc16', '#f43f5e', '#6366f1', '#f59e0b', '#06b6d4',
  '#64748b', '#d946ef', '#10b981', '#7c3aed', '#92400e',
];

// ---------- สกินรองเท้าฟรี 20 แบบ (ขาวลายสี 10 + สีเต็มคู่ 10) ----------
const SHOE_SHAPES: GearShape[] = ['sneaker', 'hightop'];

const FREE_SHOES: { primary: string; detail?: string }[] = [
  { primary: '#f8fafc', detail: '#ef4444' },
  { primary: '#f8fafc', detail: '#3b82f6' },
  { primary: '#f8fafc', detail: '#22c55e' },
  { primary: '#f8fafc', detail: '#f97316' },
  { primary: '#f8fafc', detail: '#8b5cf6' },
  { primary: '#27272a', detail: '#e5e7eb' },
  { primary: '#f8fafc', detail: '#14b8a6' },
  { primary: '#f8fafc', detail: '#ec4899' },
  { primary: '#f8fafc', detail: '#eab308' },
  { primary: '#f8fafc', detail: '#0ea5e9' },
  { primary: '#84cc16' },
  { primary: '#f43f5e' },
  { primary: '#6366f1' },
  { primary: '#f59e0b' },
  { primary: '#06b6d4' },
  { primary: '#64748b' },
  { primary: '#d946ef' },
  { primary: '#10b981' },
  { primary: '#7c3aed' },
  { primary: '#92400e' },
];

// ---------- สกินร้านค้า — ไม้แบดเท่ห์ 10 แบบ (100 เหรียญ) ----------
const SHOP_RACKETS: GearSkin[] = [
  { id: 'r21', name: 'ไม้ทองคำ', kind: 'racket', shape: 'oval', price: SHOP_PRICE, primary: '#fbbf24', string: '#fef3c7', accent: '#1c1917', detail: '#b45309' },
  { id: 'r22', name: 'ไม้เพลิงมัจจุราช', kind: 'racket', shape: 'tear', price: SHOP_PRICE, primary: '#dc2626', string: '#fb923c', accent: '#18181b', detail: '#7f1d1d' },
  { id: 'r23', name: 'ไม้เนออนซิตี้', kind: 'racket', shape: 'wide', price: SHOP_PRICE, primary: '#22d3ee', string: '#f0abfc', accent: '#0f172a', detail: '#0e7490' },
  { id: 'r24', name: 'ไม้แกแล็กซี', kind: 'racket', shape: 'oval', price: SHOP_PRICE, primary: '#7c3aed', string: '#c4b5fd', accent: '#0b1120', detail: '#312e81' },
  { id: 'r25', name: 'ไม้คาร์บอนโปร', kind: 'racket', shape: 'wide', price: SHOP_PRICE, primary: '#18181b', string: '#a1a1aa', accent: '#dc2626', detail: '#3f3f46' },
  { id: 'r26', name: 'ไม้มรกตราชินี', kind: 'racket', shape: 'tear', price: SHOP_PRICE, primary: '#059669', string: '#6ee7b7', accent: '#064e3b', detail: '#022c22' },
  { id: 'r27', name: 'ไม้สายฟ้าขั้นสุด', kind: 'racket', shape: 'oval', price: SHOP_PRICE, primary: '#facc15', string: '#fef9c3', accent: '#1d4ed8', detail: '#a16207' },
  { id: 'r28', name: 'ไม้เลือดมังกร', kind: 'racket', shape: 'tear', price: SHOP_PRICE, primary: '#991b1b', string: '#f87171', accent: '#0c0a09', detail: '#450a0a' },
  { id: 'r29', name: 'ไม้ไซเบอร์แอ็ค', kind: 'racket', shape: 'wide', price: SHOP_PRICE, primary: '#06b6d4', string: '#38bdf8', accent: '#052e16', detail: '#164e63' },
  { id: 'r30', name: 'ไม้สตาร์พิงค์', kind: 'racket', shape: 'oval', price: SHOP_PRICE, primary: '#f472b6', string: '#fdf2f8', accent: '#6b21a8', detail: '#9d174d' },
];

// ---------- สกินร้านค้า — รองเท้าเท่ห์ 10 แบบ (100 เหรียญ) ----------
const SHOP_SHOES: GearSkin[] = [
  { id: 's21', name: 'รองเท้าทองคำ', kind: 'shoe', shape: 'hightop', price: SHOP_PRICE, primary: '#fbbf24', string: '#fef3c7', accent: '#1c1917', detail: '#b45309' },
  { id: 's22', name: 'รองเท้าเพลิง', kind: 'shoe', shape: 'sneaker', price: SHOP_PRICE, primary: '#dc2626', string: '#fecaca', accent: '#fb923c', detail: '#7f1d1d' },
  { id: 's23', name: 'รองเท้าเนออน', kind: 'shoe', shape: 'hightop', price: SHOP_PRICE, primary: '#22d3ee', string: '#ecfeff', accent: '#f0abfc', detail: '#0e7490' },
  { id: 's24', name: 'รองเท้าแกแล็กซี', kind: 'shoe', shape: 'sneaker', price: SHOP_PRICE, primary: '#7c3aed', string: '#ede9fe', accent: '#c4b5fd', detail: '#312e81' },
  { id: 's25', name: 'รองเท้าคาร์บอน', kind: 'shoe', shape: 'hightop', price: SHOP_PRICE, primary: '#18181b', string: '#e4e4e7', accent: '#52525b', detail: '#dc2626' },
  { id: 's26', name: 'รองเท้ามรกต', kind: 'shoe', shape: 'sneaker', price: SHOP_PRICE, primary: '#059669', string: '#d1fae5', accent: '#6ee7b7', detail: '#064e3b' },
  { id: 's27', name: 'รองเท้าสายฟ้า', kind: 'shoe', shape: 'hightop', price: SHOP_PRICE, primary: '#facc15', string: '#fef9c3', accent: '#1d4ed8', detail: '#a16207' },
  { id: 's28', name: 'รองเท้ามังกรแดง', kind: 'shoe', shape: 'sneaker', price: SHOP_PRICE, primary: '#991b1b', string: '#fee2e2', accent: '#f87171', detail: '#450a0a' },
  { id: 's29', name: 'รองเท้าไซเบอร์', kind: 'shoe', shape: 'hightop', price: SHOP_PRICE, primary: '#06b6d4', string: '#cffafe', accent: '#22c55e', detail: '#164e63' },
  { id: 's30', name: 'รองเท้าสตาร์พิงค์', kind: 'shoe', shape: 'sneaker', price: SHOP_PRICE, primary: '#f472b6', string: '#fbcfe8', accent: '#fdf2f8', detail: '#9d174d' },
];

// ---------- ประกอบรายการทั้งหมด ----------
export const RACKET_SKINS: GearSkin[] = [
  ...FREE_RACKET_COLORS.map((primary, i) => ({
    id: `r${i + 1}`,
    name: `ไม้แบดคลาสสิก ${i + 1}`,
    kind: 'racket' as const,
    shape: RACKET_SHAPES[i % 3],
    price: 0,
    primary,
    string: '#e7e5e4',
    accent: GRIPS[i % 3],
    detail: shade(primary, 0.65),
  })),
  ...SHOP_RACKETS,
];

export const SHOE_SKINS: GearSkin[] = [
  ...FREE_SHOES.map((s, i) => ({
    id: `s${i + 1}`,
    name: `รองเท้าแบดคลาสสิก ${i + 1}`,
    kind: 'shoe' as const,
    shape: SHOE_SHAPES[i % 2],
    price: 0,
    primary: s.primary,
    // รองเท้าขาว: เชือก/พื้นต้องเข้มพอที่จะมองเห็นรูปทรงบนพื้นการ์ดสว่าง
    string: s.detail ? '#94a3b8' : '#e5e7eb',
    accent: s.detail ? '#cbd5e1' : '#f1f5f9',
    detail: s.detail ?? shade(s.primary, 0.6),
  })),
  ...SHOP_SHOES,
];

const GEAR_BY_ID = new Map([...RACKET_SKINS, ...SHOE_SKINS].map((g) => [g.id, g]));

export function getGear(id: string): GearSkin | undefined {
  return GEAR_BY_ID.get(id);
}

// สกินล็อคอยู่ไหม (สกินฟรีปลดล็อคเสมอ, สกินร้านต้องซื้อแล้ว)
export function isGearLocked(gear: GearSkin, unlockedIds: string[]): boolean {
  return gear.price > 0 && !unlockedIds.includes(gear.id);
}
