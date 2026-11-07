'use client';

import { useMemo } from 'react';
import type { FoodMenuId } from '@/lib/food-menus';

// ============================================================
// ภาพเมนูอาหารการ์ตูนพิกเซล 8-บิต (16×16) — วาดจากแผนที่พิกเซล
// ข้าวต้ม / ชาบู / สเต็ก / ซูชิ / ส้มตำ / IRON GRILL
// ใช้ใน popup สุ่มเมนูอาหาร (ใหญ่) และปุ่มบน HUD (เล็ก)
// อักขระ '.' = โปร่ง (ไม่วาด)
// ============================================================

// โทนสีรวมที่ใช้ร่วมกัน
const P: Record<string, string> = {
  o: '#3a3a3a', // เส้นขอบเข้มทั่วไป
  s: '#cfcfcf', // ไอน้ำ
  W: '#ffffff',
  B: '#5b8fd6', // แถบน้ำเงิน (ชาม)
  C: '#f5e9c8', // ข้าวต้มครีม
  c: '#e3d0a4', // ข้าวต้มโทนเข้ม
  g: '#5fae4e', // ต้นหอม/ผักชีเขียว
  R: '#e04b3a', // น้ำซุปแดง/พริก
  O: '#8a2a1e', // ขอบหม้อแดงเข้ม
  K: '#32324a', // เนื้อหม้อ/เตารีดดำน้ำเงิน
  h: '#8a5a2a', // ไม้จับ/ไม้
  M: '#a0522d', // เนื้อสเต็ก
  k: '#5c2e10', // รอยย่างเข้ม
  P: '#f4f4f4', // จานขาว
  a: '#ffc9a0', // ลายไขมันแซลมอน
  S: '#ff8c42', // แซลมอนซูชิ
  F: '#d9a066', // ไขมันขอบสเต็ก
  N: '#fffdfa', // ข้าวซูชิ (ใกล้ขาว)
  n: '#e8e2d0', // เม็ดข้าวโทนเข้ม
  G: '#7bc043', //  papaya เขียว
  l: '#ffd23f', // มะนาว
  p: '#c9924a', // สากไม้/ขอบไม้
  D: '#8a5a2a', // ขอนไม้ส้มตำ
  f: '#ff9d2e', // ลูกไฟ
  e: '#8a8f98', // จับเตารีดเทา
};

// แผนที่พิกเซล 16×16 ต่อเมนู (แต่ละแถวยาว 16 อักขระ)
const ART: Record<FoodMenuId, string[]> = {
  // ข้าวต้ม ข้างทาง — ชามข้าวต้ม ไอน้ำ ต้นหอม แถบน้ำเงิน
  congee: [
    '................',
    '...s....s....s..',
    '...s....s....s..',
    '..ss...ss...ss..',
    '.oooooooooooooo.',
    'oCCCCCCCCCCCCCCo',
    'oCCgCCCCCCCCgCCo',
    'oCCcCCCCCCcCCCCo',
    '.oCCCCCCCCCCCCo.',
    '..oWWWWWWWWWWo..',
    '..oWWWWWWWWWWo..',
    '..oBBBBBBBBBBo..',
    '...oWWWWWWWWo...',
    '....oWWWWWWo....',
    '.....oBBBBo.....',
    '.....oooooo.....',
  ],
  // ชาบู ชาใจ — หม้อดำน้ำแดง จับไม้ เต้าหู้ขาว ไอน้ำ
  shabu: [
    '................',
    '...s...s....s...',
    '...s...s....s...',
    '..s...s....s....',
    '.ooOOOOOOOOOOoo.',
    '.oRRRRRRRRRRRRo.',
    '.oRRwRRRRRRwRRo.',
    '.oRRRRRRRRRRRRo.',
    'hhoKKKKKKKKKKohh',
    'hhoKKKKKKKKKKohh',
    '..oKKKKKKKKKKo..',
    '..oKKKKKKKKKKo..',
    '..oKKKKKKKKKKo..',
    '...oKKKKKKKKo...',
    '...oKKKKKKKKo...',
    '....oooooooo....',
  ],
  // สเต็ก ลุงวอ — เนื้อย่างขอบไขมัน รอยแผลไฟ บนจานขาว ผักชีโรยหน้า
  steak: [
    '................',
    '................',
    '....oooooo......',
    '...oFFFFFFFo....',
    '..oMMkMMMMMMo...',
    '..oMkMMkMMMMo...',
    '..oMMMMMMMMMo...',
    '..oMMkMMkMMMo...',
    '..oMMMMMMMMMo...',
    '..oMMMMMMMMo....',
    '...ooooooo......',
    '.oPPPPPPPPPPPo..',
    'oPPPPPPPPPPPPPo.',
    'oPPgPPPPPPPPPPPo',
    '.oPPPPPPPPPPPo..',
    '..ooooooooooo...',
  ],
  // ซูชิ ปิ๊แมว — นิกิริแซลมอน ลายไขมัน บนข้าวสวย
  sushi: [
    '................',
    '................',
    '................',
    '................',
    '..oooooooooooo..',
    '.oSSSSSSSSSSSSo.',
    '.oSaSSSaSSSaSSo.',
    '.oSSSSSSSSSSSSo.',
    '.oooooooooooooo.',
    '..oNNNNNNNNNNo..',
    '..oNNNNNNNNNNo..',
    '..oNNnNNNNnNNo..',
    '..oNNNNNNNNNNo..',
    '...oNNNNNNNNo...',
    '....oooooooo....',
    '................',
  ],
  // ส้มตำ ระยำใจ — ขอนไม้ สาก ตำถั่ว พริก มะนาว
  somtam: [
    '................',
    '...........pp...',
    '..........pp....',
    '.........pp.....',
    '..ooooooooopp...',
    '.oGGGGGGGGGGpo..',
    'oGGgGGgGrGGGGGo.',
    'oGGGGGlGGGGGGo..',
    'oDDDDDDDDDDDDo..',
    'oDDDDDDDDDDDDo..',
    '.oDDDDDDDDDDo...',
    '.oDDDDDDDDDDo...',
    '..oDDDDDDDDo....',
    '..oDDDDDDDDo....',
    '...oooooooo.....',
    '................',
  ],
  // IRON GRILL ริวจิตสัมผัส — เตารีดย่าง เนื้อบนแผ่น ลูกไฟใต้
  iron: [
    '................',
    '................',
    '................',
    '..oooooooooooo..',
    '..oKKMMKKMMKKo..',
    '..oKMkMMkMMkKo..',
    '..oKKKKKKKKKKo..',
    'hooooooooooooooh',
    '...f...ff...f...',
    '..ff..f..f..ff..',
    '...f.f....f.f...',
    '...o........o...',
    '...o........o...',
    '..oooooooooo....',
    '................',
    '................',
  ],
};

export function PixelFoodArt({
  menu,
  className,
}: {
  menu: FoodMenuId;
  className?: string;
}) {
  const pixels = useMemo(() => {
    const out: Array<{ x: number; y: number; fill: string }> = [];
    const rows = ART[menu];
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch !== '.' && P[ch]) out.push({ x, y, fill: P[ch] });
      });
    });
    return out;
  }, [menu]);

  return (
    <svg
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {pixels.map((p) => (
        <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width={1.02} height={1.02} fill={p.fill} />
      ))}
    </svg>
  );
}
