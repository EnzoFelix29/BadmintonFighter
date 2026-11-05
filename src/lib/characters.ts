// ============================================================
// ระบบตัวละคร 8-bit — 30 สกิน (ชาย 15 / หญิง 15)
// ตัวละครถูกวาดจากพิกเซลแพทเทิร์น 12x14 บนกริด ด้วย SVG
// อักษรในแพทเทิร์น:
//   .  โปร่งใส      H  ผม           S  ผิว           E  ตา
//   C  เสื้อ         D  ลายเสื้อ (เฉดเข้ม)  P  กางเกง/กระโปรง
//   K  หมวก/ริบบิ้น   A  รองเท้า
// ============================================================

export type Gender = 'male' | 'female';

export interface Skin {
  id: string;
  name: string;
  gender: Gender;
  hair: string; // ชื่อทรงผม (key ของแพทเทิร์น)
  hairColor: string;
  skinColor: string;
  shirtColor: string;
  pantColor: string;
  accentColor: string; // หมวก / ริบบิ้น / รองเท้า
}

// ทำสีให้เข้มลง/อ่อนลง (factor < 1 เข้มขึ้น, > 1 อ่อนขึ้น)
export function shade(hex: string, factor: number): string {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)));
  return `#${f(r).toString(16).padStart(2, '0')}${f(g).toString(16).padStart(2, '0')}${f(b)
    .toString(16)
    .padStart(2, '0')}`;
}

// ---------- แพทเทิร์นฝั่งชาย (หัว 7 แถว + ตัว 7 แถว) ----------
const MALE_HEADS: Record<string, string[]> = {
  short: [
    '....HHHH....',
    '..HHHHHHHH..',
    '..HHHHHHHH..',
    '..HSSSSSSH..',
    '...SESSES...',
    '...SSSSSS...',
    '....SSSS....',
  ],
  spiky: [
    '..H.HHHH.H..',
    '..HHHHHHHH..',
    '..HHHHHHHH..',
    '..HSSSSSSH..',
    '...SESSES...',
    '...SSSSSS...',
    '....SSSS....',
  ],
  buzz: [
    '....SSSS....',
    '...HHHHHH...',
    '...SSSSSS...',
    '...SSSSSS...',
    '...SESSES...',
    '...SSSSSS...',
    '....SSSS....',
  ],
  cap: [
    '....KKKK....',
    '..KKKKKKKK..',
    '..KKKKKKKK..',
    '..KSSSSSSK..',
    '...SESSES...',
    '...SSSSSS...',
    '....SSSS....',
  ],
  headband: [
    '....HHHH....',
    '..HHHHHHHH..',
    '..KKKKKKKK..',
    '..HSSSSSSH..',
    '...SESSES...',
    '...SSSSSS...',
    '....SSSS....',
  ],
};

const MALE_BODY: string[] = [
  '..CCCCCCCC..',
  '.CCCCCCCCCC.',
  '.SCCCCCCCCS.',
  '..CCDDDDCC..',
  '...PPPPPP...',
  '...PP..PP...',
  '...AA..AA...',
];

// ---------- แพทเทิร์นฝั่งหญิง (ครบ 14 แถว เพราะเส้นผมต่างกันทั้งตัว) ----------
const FEMALE_PATTERNS: Record<string, string[]> = {
  long: [
    '....HHHH....',
    '..HHHHHHHH..',
    '..HHHHHHHH..',
    '..HSSSSSSH..',
    '.HHSESSESHH.',
    '.HHSSSSSSHH.',
    '.HH.SSSS.HH.',
    '.HHCCCCCCHH.',
    '.HHCCCCCCHH.',
    '.HSCCCCCCSH.',
    '..CDDDDDDC..',
    '...PPPPPP...',
    '...PP..PP...',
    '...AA..AA...',
  ],
  twin: [
    '....HHHH....',
    '..HHHHHHHH..',
    '..HHHHHHHH..',
    '.H.SSSSSS.H.',
    '.H.SESSES.H.',
    '.H.SSSSSS.H.',
    '.H..SSSS..H.',
    '..CCCCCCCC..',
    '.CCCCCCCCCC.',
    '.SCCCCCCCCS.',
    '..CDDDDDDC..',
    '...PPPPPP...',
    '...PP..PP...',
    '...AA..AA...',
  ],
  bob: [
    '....HHHH....',
    '..HHHHHHHH..',
    '..HHHHHHHH..',
    '..HSSSSSSH..',
    '..HSESSESH..',
    '..HSSSSSSH..',
    '....SSSS....',
    '..CCCCCCCC..',
    '.CCCCCCCCCC.',
    '.SCCCCCCCCS.',
    '..CDDDDDDC..',
    '...PPPPPP...',
    '...PP..PP...',
    '...AA..AA...',
  ],
  bun: [
    '.....HH.....',
    '....HHHH....',
    '..HHHHHHHH..',
    '..HSSSSSSH..',
    '...SESSES...',
    '...SSSSSS...',
    '....SSSS....',
    '..CCCCCCCC..',
    '.CCCCCCCCCC.',
    '.SCCCCCCCCS.',
    '..CDDDDDDC..',
    '...PPPPPP...',
    '...PP..PP...',
    '...AA..AA...',
  ],
  pony: [
    '....HHHH....',
    '..HHHHHHHH..',
    '..HHHHHHHHH.',
    '..HSSSSSSHH.',
    '..HSESSESHH.',
    '..HSSSSSSHH.',
    '....SSSS.HH.',
    '..CCCCCCCCH.',
    '.CCCCCCCCCH.',
    '.SCCCCCCCCS.',
    '..CDDDDDDC..',
    '...PPPPPP...',
    '...PP..PP...',
    '...AA..AA...',
  ],
};

// ---------- คลัง 30 สกิน ----------
export const SKINS: Skin[] = [
  // ===== ชาย (15) =====
  { id: 'm1', name: 'เจมส์', gender: 'male', hair: 'short', hairColor: '#6b4423', skinColor: '#ffdcb8', shirtColor: '#ef4444', pantColor: '#1e293b', accentColor: '#f1f5f9' },
  { id: 'm2', name: 'บอส', gender: 'male', hair: 'short', hairColor: '#2d2a32', skinColor: '#eab98f', shirtColor: '#f59e0b', pantColor: '#1f2937', accentColor: '#ef4444' },
  { id: 'm3', name: 'ต้น', gender: 'male', hair: 'buzz', hairColor: '#2d2a32', skinColor: '#c68642', shirtColor: '#22c55e', pantColor: '#334155', accentColor: '#16a34a' },
  { id: 'm4', name: 'ก้อง', gender: 'male', hair: 'spiky', hairColor: '#f5c542', skinColor: '#ffdcb8', shirtColor: '#f97316', pantColor: '#1f2937', accentColor: '#fbbf24' },
  { id: 'm5', name: 'ปอนด์', gender: 'male', hair: 'buzz', hairColor: '#4a3728', skinColor: '#eab98f', shirtColor: '#64748b', pantColor: '#1e293b', accentColor: '#94a3b8' },
  { id: 'm6', name: 'น็อต', gender: 'male', hair: 'spiky', hairColor: '#e05252', skinColor: '#ffdcb8', shirtColor: '#8b5cf6', pantColor: '#312e81', accentColor: '#a78bfa' },
  { id: 'm7', name: 'โอ๊ต', gender: 'male', hair: 'cap', hairColor: '#4a3728', skinColor: '#9c6644', shirtColor: '#14b8a6', pantColor: '#334155', accentColor: '#0ea5e9' },
  { id: 'm8', name: 'ฟลุ๊ค', gender: 'male', hair: 'cap', hairColor: '#2d2a32', skinColor: '#ffdcb8', shirtColor: '#1f2937', pantColor: '#475569', accentColor: '#ef4444' },
  { id: 'm9', name: 'เดียร์', gender: 'male', hair: 'short', hairColor: '#4aa3df', skinColor: '#eab98f', shirtColor: '#e2e8f0', pantColor: '#1e293b', accentColor: '#4aa3df' },
  { id: 'm10', name: 'ภูมิ', gender: 'male', hair: 'headband', hairColor: '#2d2a32', skinColor: '#c68642', shirtColor: '#eab308', pantColor: '#44403c', accentColor: '#ef4444' },
  { id: 'm11', name: 'พีค', gender: 'male', hair: 'headband', hairColor: '#f5c542', skinColor: '#ffdcb8', shirtColor: '#334155', pantColor: '#1e293b', accentColor: '#3b82f6' },
  { id: 'm12', name: 'ตะวัน', gender: 'male', hair: 'spiky', hairColor: '#f28c28', skinColor: '#9c6644', shirtColor: '#be123c', pantColor: '#1f2937', accentColor: '#fb923c' },
  { id: 'm13', name: 'หมูแดง', gender: 'male', hair: 'buzz', hairColor: '#2d2a32', skinColor: '#eab98f', shirtColor: '#dc2626', pantColor: '#7f1d1d', accentColor: '#fca5a5' },
  { id: 'm14', name: 'ไข่ดาว', gender: 'male', hair: 'short', hairColor: '#f5c542', skinColor: '#ffdcb8', shirtColor: '#facc15', pantColor: '#e2e8f0', accentColor: '#f59e0b' },
  { id: 'm15', name: 'ชาเย็น', gender: 'male', hair: 'cap', hairColor: '#2d2a32', skinColor: '#c68642', shirtColor: '#b45309', pantColor: '#1c1917', accentColor: '#16a34a' },

  // ===== หญิง (15) =====
  { id: 'f1', name: 'มินท์', gender: 'female', hair: 'long', hairColor: '#7fd8be', skinColor: '#ffdcb8', shirtColor: '#f8fafc', pantColor: '#14b8a6', accentColor: '#10b981' },
  { id: 'f2', name: 'พลอย', gender: 'female', hair: 'bob', hairColor: '#2d2a32', skinColor: '#eab98f', shirtColor: '#ec4899', pantColor: '#831843', accentColor: '#f9a8d4' },
  { id: 'f3', name: 'มุก', gender: 'female', hair: 'long', hairColor: '#2d2a32', skinColor: '#ffdcb8', shirtColor: '#ef4444', pantColor: '#991b1b', accentColor: '#fca5a5' },
  { id: 'f4', name: 'เนย', gender: 'female', hair: 'bun', hairColor: '#f5c542', skinColor: '#ffdcb8', shirtColor: '#fb923c', pantColor: '#7c2d12', accentColor: '#fed7aa' },
  { id: 'f5', name: 'ฟ้า', gender: 'female', hair: 'twin', hairColor: '#60a5fa', skinColor: '#ffdcb8', shirtColor: '#e0f2fe', pantColor: '#2563eb', accentColor: '#3b82f6' },
  { id: 'f6', name: 'พราว', gender: 'female', hair: 'twin', hairColor: '#f472b6', skinColor: '#eab98f', shirtColor: '#a855f7', pantColor: '#581c87', accentColor: '#d8b4fe' },
  { id: 'f7', name: 'เมย์', gender: 'female', hair: 'bob', hairColor: '#a1662f', skinColor: '#ffdcb8', shirtColor: '#65a30d', pantColor: '#365314', accentColor: '#a3e635' },
  { id: 'f8', name: 'จูน', gender: 'female', hair: 'bun', hairColor: '#9b7ede', skinColor: '#c68642', shirtColor: '#0d9488', pantColor: '#134e4a', accentColor: '#5eead4' },
  { id: 'f9', name: 'แพร', gender: 'female', hair: 'long', hairColor: '#6b4423', skinColor: '#ffdcb8', shirtColor: '#fb7185', pantColor: '#881337', accentColor: '#fecdd3' },
  { id: 'f10', name: 'นิล', gender: 'female', hair: 'pony', hairColor: '#312e81', skinColor: '#eab98f', shirtColor: '#6366f1', pantColor: '#1e1b4b', accentColor: '#a5b4fc' },
  { id: 'f11', name: 'มะลิ', gender: 'female', hair: 'bun', hairColor: '#3f3f46', skinColor: '#ffdcb8', shirtColor: '#f4f4f5', pantColor: '#e4e4e7', accentColor: '#fda4af' },
  { id: 'f12', name: 'วาฟเฟิล', gender: 'female', hair: 'bob', hairColor: '#eab308', skinColor: '#eab98f', shirtColor: '#d97706', pantColor: '#78350f', accentColor: '#fcd34d' },
  { id: 'f13', name: 'สตรอว์', gender: 'female', hair: 'twin', hairColor: '#e05252', skinColor: '#ffdcb8', shirtColor: '#fb7185', pantColor: '#be123c', accentColor: '#fecaca' },
  { id: 'f14', name: 'โมจิ', gender: 'female', hair: 'bun', hairColor: '#f9a8d4', skinColor: '#eab98f', shirtColor: '#fef3c7', pantColor: '#d6d3d1', accentColor: '#fbcfe8' },
  { id: 'f15', name: 'ครีม', gender: 'female', hair: 'long', hairColor: '#fde68a', skinColor: '#ffdcb8', shirtColor: '#fdba74', pantColor: '#9a3412', accentColor: '#ffedd5' },
];

const SKIN_BY_ID = new Map(SKINS.map((s) => [s.id, s]));
export const SKIN_BY_NAME = new Map(SKINS.map((s) => [s.name, s]));

export function getSkin(id: string): Skin | undefined {
  return SKIN_BY_ID.get(id);
}

// รวมแพทเทิร์นทั้งตัว (14 แถว x 12 คอลัมน์) ของสกินหนึ่งตัว
export function patternFor(skin: Skin): string[] {
  if (skin.gender === 'male') {
    const head = MALE_HEADS[skin.hair] ?? MALE_HEADS.short;
    return [...head, ...MALE_BODY];
  }
  return FEMALE_PATTERNS[skin.hair] ?? FEMALE_PATTERNS.long;
}

// แผนที่อักษร -> สี ของสกินหนึ่งตัว
export function colorMapFor(skin: Skin): Record<string, string> {
  return {
    H: skin.hairColor,
    S: skin.skinColor,
    E: '#1f2937',
    C: skin.shirtColor,
    D: shade(skin.shirtColor, 0.65),
    P: skin.pantColor,
    K: skin.accentColor,
    A: shade(skin.accentColor, 0.9),
  };
}
