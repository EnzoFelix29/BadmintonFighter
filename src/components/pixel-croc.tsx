'use client';

import { useMemo } from 'react';

// ============================================================
// จระเข้พิกเซล 8-บิต — มินิเกมจระเข้กดนิ้ว
// อ้างอิงของเล่นจระเข้กัดนิ้ว: ตัวเขียว ตาโปน ปากอ้ากว้าง
// ช่องปากแดง ฟันขาวเรียงเป็นแถวบน-ล่าง + มือกดนิ้ว + ลิ้น
// วาดจากแผนที่อักขระ (แถวละ 64 อักขระ) '.' = โปร่ง
// ============================================================

// ชุดสี (พาเลตต์ 8-บิต)
const C: Record<string, string> = {
  o: '#14532d', // เส้นขอบเขียวเข้ม
  G: '#43a047', // เขียวลำตัว
  l: '#7bd45e', // เขียวไฮไลต์
  d: '#2e7d32', // เขียวเงา / รากฟัน
  W: '#ffffff', // ฟันขาว
  w: '#cfd8dc', // เงาฟัน
  K: '#1b1b1b', // รูผีเสื้อ
  R: '#ef5350', // ฟันเสีย (แดง)
  r: '#7f1d1d', // ขอบฟันเสีย
  F: '#f6c99f', // ผิวมือ
  f: '#e0a172', // เงามือ
  T: '#ef7d7d', // ลิ้น
  t: '#d95a5a', // เงาลิ้น
};

type Px = { x: number; y: number; fill: string };

function toPixels(rows: string[]): Px[] {
  const out: Px[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== '.' && C[ch]) out.push({ x, y, fill: C[ch] });
    });
  });
  return out;
}

// ---------- ขากรรไกรบน + หัว + ตา (64×23) ----------
// ตาโปนสองข้างชี้ลงตรงกลาง (มองฟัน) / จมูก 2 รู / รากฟันเขียวเข้มแถวล่าง
const UPPER: string[] = [
  '...............oooooooooooo..........oooooooooooo...............',
  '..............oWWWWWWWWWWWWo........oWWWWWWWWWWWWo..............',
  '..............oWWWWWWWWWWWWo........oWWWWWWWWWWWWo..............',
  '..............oWWWWWWWWWKKWo........oWKKWWWWWWWWWo..............',
  '..............oWWWWWWWWWKKWo........oWKKWWWWWWWWWo..............',
  '..............oWWWWWWWWWWWWo........oWWWWWWWWWWWWo..............',
  '..oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo..',
  '.oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo.',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'ollllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGooGGGGGGGGooGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGooGGGGGGGGooGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGdGGGGGGGGGGGdGGGGGGGGGGGdGGGGGGGGGGGdGGGGGGGGGGGdGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddo',
  '.oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo.',
];

// ตาหลับ (ตอนโดนกัด) — เปลี่ยนแถว 1-5 เป็นเขียว + รอยหลับตาเป็นเส้นดำ
const SQUINT_SWAP: Record<number, string> = {
  1: '..............oGGGGGGGGGGGGo........oGGGGGGGGGGGGo..............',
  2: '..............oGGGGGGGGGGGGo........oGGGGGGGGGGGGo..............',
  3: '..............oGGGGKKKKGGGGo........oGGGGKKKKGGGGo..............',
  4: '..............oGGGGGGGGGGGGo........oGGGGGGGGGGGGo..............',
  5: '..............oGGGGGGGGGGGGo........oGGGGGGGGGGGGo..............',
};

// ---------- ขากรรไกรล่าง + คาง (64×18) ----------
const LOWER: string[] = [
  '.oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo.',
  'oddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGdGGGGGGGGGGGdGGGGGGGGGGGdGGGGGGGGGGGdGGGGGGGGGGGdGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  '..oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo..',
  '....oooooooooooooooooooooooooooooooooooooooooooooooooooooooo....',
  '......oooooooooooooooooooooooooooooooooooooooooooooooooooo......',
];

// ---------- ฟัน 3 สถานะ (กว้าง 6 พิกเซล) ----------
// ปกติ = แหลมยาว / กดแล้ว = จมเหลือตอ / ฟันเสีย = แดงกระพริบ
const TOOTH_NORMAL = ['oooooo', 'oWWWwo', 'oWWWwo', 'oWWWwo', '.oWwo.', '.oWwo.', '..oo..'];
const TOOTH_PRESSED = ['oooooo', 'owwwwo', '..oo..'];
const TOOTH_SORE = ['rrrrrr', 'rRRRro', 'rRRRro', '.rRro.', '.rRro.', '..rr..'];

// ---------- มือกดนิ้ว (16×15) นิ้วชี้เบื้องล่าง ----------
const HAND = [
  '....oooooo......',
  '...oFFFFFfo.....',
  '..oFFFFFFffo....',
  '..oFFFFFFffo....',
  '..oFFFFFFffo....',
  '..oFFFFFFffo....',
  '..oFFFFFFffo....',
  '...oFFFFfffo....',
  '....oFFfo.......',
  '....oFFfo.......',
  '....oFFfo.......',
  '....oFFfo.......',
  '....oFFfo.......',
  '....oFFfo.......',
  '....ooooo.......',
];

// ---------- ลิ้น (12×5) ----------
const TONGUE = ['...oooooo...', '..oTTTTtTo..', '.oTTTTTtTTo.', '.oTTTTTtTTo.', '..oooooooo..'];

function PixelSvg({
  rows,
  className,
  flipY = false,
}: {
  rows: string[];
  className?: string;
  flipY?: boolean;
}) {
  const pixels = useMemo(() => toPixels(rows), [rows]);
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g transform={flipY ? `translate(0,${h}) scale(1,-1)` : undefined}>
        {pixels.map((p) => (
          <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width={1.02} height={1.02} fill={p.fill} />
        ))}
      </g>
    </svg>
  );
}

// ขากรรไกรบน — squint=true หลับตาตอนกัด
export function PixelCrocUpper({
  squint = false,
  className,
}: {
  squint?: boolean;
  className?: string;
}) {
  const rows = useMemo(
    () => (squint ? UPPER.map((row, i) => SQUINT_SWAP[i] ?? row) : UPPER),
    [squint],
  );
  return <PixelSvg rows={rows} className={className} />;
}

// ขากรรไกรล่าง
export function PixelCrocLower({ className }: { className?: string }) {
  return <PixelSvg rows={LOWER} className={className} />;
}

// ฟันซี่เดียว — variant: ปกติ/กดแล้ว/ฟันเสีย, dir: down = ห้อยลง (แถวบน), up = ตั้งขึ้น (แถวล่าง)
export function PixelTooth({
  variant = 'normal',
  dir = 'down',
  className,
}: {
  variant?: 'normal' | 'pressed' | 'sore';
  dir?: 'down' | 'up';
  className?: string;
}) {
  const rows = variant === 'pressed' ? TOOTH_PRESSED : variant === 'sore' ? TOOTH_SORE : TOOTH_NORMAL;
  return <PixelSvg rows={rows} className={className} flipY={dir === 'up'} />;
}

// มือกดนิ้ว — flip=true กลับหัว (ใช้กดฟันแถวบน)
export function PixelHand({ flip = false, className }: { flip?: boolean; className?: string }) {
  return <PixelSvg rows={HAND} className={className} flipY={flip} />;
}

// ลิ้น
export function PixelTongue({ className }: { className?: string }) {
  return <PixelSvg rows={TONGUE} className={className} />;
}
