'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { HudSkin } from '@/lib/hud-skins';

type SoundFn = (kind: 'success' | 'error' | 'open' | 'clear' | 'select' | 'tick') => void;

// ============================================================
// มินิเกม ดีโน่รัน (Chrome Dino) — ไดโนเสาร์พิกเซล 8-บิต วิ่งหลบแคคตัส
// กระโดด: กด SPACE / ↑ / W หรือแตะพื้นที่เล่น • คะแนนเพิ่มตามระยะทาง
// ความเร็วค่อย ๆ เพิ่ม • ชนแคคตัส = จบเกม
// สถิติสูงสุดเก็บใน localStorage: badminton_dino_best
// วาดไดโนเสาร์/แคคตัส/เมฆจากแผนที่พิกเซล (SVG crispEdges สองเฟรมวิ่ง)
// ============================================================

const DINO_BEST_KEY = 'badminton_dino_best';

// ฟิสิกส์ (หน่วย px และวินาที)
const FIELD_H = 176; // ความสูงพื้นที่เล่น
const GROUND = 14; // ระยะพื้นจากขอบล่าง
const DINO_X = 14; // ตำแหน่งซ้ายของไดโนเสาร์
const DINO_W = 30; // ความกว้างตัวไดโนเสาร์ (px)
const DINO_H = 31.5; // สูง 20x21 ที่สเกล 1.5
const JUMP_V = 740; // ความเร็วต้นกระโดด
const GRAVITY = 2600; // แรงโน้มถ่วง
const SPEED_START = 230;
const SPEED_MAX = 560;
const SPEED_ACC = 9; // เร่งความเร็วต่อวินาที

type Phase = 'idle' | 'playing' | 'over';

interface Obstacle {
  x: number;
  w: number;
  h: number;
  n: number; // จำนวนลำต้นแคคตัส 1-3
}

interface Phys {
  y: number;
  vy: number;
  obs: Obstacle[];
  speed: number;
  dist: number;
  score: number;
  milestone: number;
  distSinceSpawn: number;
  spawnGap: number;
  legT: number;
  legFrame: 0 | 1;
  dots: number[];
  clouds: { x: number; y: number }[];
  W: number;
}

function freshPhys(W: number): Phys {
  return {
    y: 0,
    vy: 0,
    obs: [],
    speed: SPEED_START,
    dist: 0,
    score: 0,
    milestone: 0,
    distSinceSpawn: 0,
    spawnGap: 420,
    legT: 0,
    legFrame: 0,
    dots: Array.from({ length: 12 }, () => Math.random() * (W + 8)),
    clouds: [
      { x: W * 0.55, y: 18 },
      { x: W * 0.2, y: 46 },
    ],
    W,
  };
}

// ===== แผนที่พิกเซล — '.' = โปร่ง, 'X' = ตัว, 'o' = ตา =====
const DINO_BASE: string[] = [
  '.........XXXXXXXXX.',
  '........XXXXXXXXXXX',
  '........XXoXXXXXXXX',
  '........XXXXXXXXXXX',
  '........XXXXXXXXXXX',
  '........XXXXXXXX...',
  '........XXXXXX.....',
  'X.......XXXXXX.....',
  'XX.....XXXXXXX.....',
  'XXX...XXXXXXXXX....',
  'XXXX.XXXXXXXXXXXX..',
  '..XXXXXXXXXXXXXXX..',
  '..XXXXXXXXXXXXXXX..',
  '...XXXXXXXXXXXXX...',
  '....XXXXXXXXXXX....',
  '.....XXXXXXXXX.....',
  '......XXXXXXX......',
];

// ขา 2 เฟรม (สลับเวลาวิ่ง)
const DINO_LEGS_A: string[] = [
  '......XX..XX.......',
  '......XX..XX.......',
  '......XX...XX......',
  '......XXX..XXX.....',
];
const DINO_LEGS_B: string[] = [
  '......XX..XX.......',
  '......XX..XX.......',
  '......XX...XX......',
  '.......XXX.XXX.....',
];

const CACTUS_ART: string[] = [
  '....XX....',
  '....XX....',
  'X...XX...X',
  'X...XX...X',
  'X...XX...X',
  'X...XX...X',
  'X...XX...X',
  'XX..XX..XX',
  '.XXXXX..XX',
  '....XXXXXX',
  '....XX....',
  '....XX....',
  '....XX....',
  '....XX....',
];

const CLOUD_ART: string[] = ['..XXX..', '.XXXXX.', 'XXXXXXX'];

// วาดแผนที่พิกเซลเป็น SVG (currentColor)
function PixelMap({
  art,
  eyeCol,
  className,
  style,
}: {
  art: string[];
  eyeCol?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const w = art[0].length;
  const h = art.length;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {art.map((row, y) =>
        [...row].map((ch, x) => {
          if (ch === '.') return null;
          const isEye = ch === 'o';
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1.02}
              height={1.02}
              fill={isEye ? (eyeCol ?? 'rgba(0,0,0,0.45)') : 'currentColor'}
            />
          );
        })
      )}
    </svg>
  );
}

export function DinoGameModal({
  open,
  skin,
  sound,
  onClose,
}: {
  open: boolean;
  skin: HudSkin;
  sound: SoundFn;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [best, setBest] = useState(0);
  const [newRecord, setNewRecord] = useState(false);

  const fieldRef = useRef<HTMLDivElement | null>(null);
  const physRef = useRef<Phys>(freshPhys(340));
  const phaseRef = useRef<Phase>('idle');
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const [, forceTick] = useState(0); // บังคับวาดใหม่ทุกเฟรม

  // โหลดสถิติสูงสุด + รีเซ็ตตอนเปิด popup
  useEffect(() => {
    if (!open) return;
    try {
      setBest(parseInt(localStorage.getItem(DINO_BEST_KEY) || '0', 10) || 0);
    } catch {
      // ไม่มี localStorage ข้าม
    }
    setPhase('idle');
    phaseRef.current = 'idle';
    setNewRecord(false);
    physRef.current = freshPhys(fieldRef.current?.clientWidth ?? 340);
    return () => stopLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function stopLoop() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  // ตัววนเกม (requestAnimationFrame — เคลื่อนตามเวลาจริง dt)
  function startLoop() {
    stopLoop();
    lastRef.current = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05); // กันกระโดดเฟรมหลังสลับแท็บ
      lastRef.current = now;
      const p = physRef.current;

      // ความเร็ว + ระยะ + คะแนน
      p.speed = Math.min(SPEED_MAX, p.speed + SPEED_ACC * dt);
      const dx = p.speed * dt;
      p.dist += dx;
      const sc = Math.floor(p.dist / 8);
      if (sc !== p.score) {
        p.score = sc;
        if (Math.floor(sc / 100) > p.milestone) {
          p.milestone = Math.floor(sc / 100);
          sound('tick'); // ครบทุก 100 แต้ม เสียงติ๊กน้อง ๆ
        }
      }

      // กระโดด: โน้มถ่วง (y = ความสูงจากพื้น, vy เป็นบวก = พุ่งขึ้น)
      if (p.y > 0 || p.vy !== 0) {
        p.vy -= GRAVITY * dt;
        p.y += p.vy * dt;
        if (p.y <= 0) {
          p.y = 0;
          p.vy = 0;
        }
      }

      // ขาวิ่งสลับเฟรมตามระยะก้าว
      p.legT += dx;
      if (p.legT >= 26) {
        p.legT = 0;
        p.legFrame = p.legFrame === 0 ? 1 : 0;
      }

      // ขยับแคคตัส + ลบตัวพ้นจอ
      p.obs = p.obs
        .map((o) => ({ ...o, x: o.x - dx }))
        .filter((o) => o.x + o.w > -4);
      p.distSinceSpawn += dx;
      if (p.distSinceSpawn >= p.spawnGap) spawnCactus(p);

      // จุดพื้น + เมฆลอย (ช้ากว่าเกมเพื่อให้ดูลึก)
      p.dots = p.dots.map((d) => (d - dx < -4 ? d + p.W + 8 : d - dx));
      p.clouds = p.clouds.map((c) => {
        const nx = c.x - dx * 0.14;
        return nx < -30 ? { ...c, x: p.W + 10 } : { ...c, x: nx };
      });

      // ชนแคคตัส? (กล่องชนลดขนาดให้เฟรนด์ลีย์)
      const dinoBox = {
        l: DINO_X + 5,
        r: DINO_X + DINO_W - 6,
        t: FIELD_H - GROUND - p.y - DINO_H + 4,
        b: FIELD_H - GROUND - p.y - 1,
      };
      const hit = p.obs.some((o) => {
        const cBox = { l: o.x + 3, r: o.x + o.w - 3, t: FIELD_H - GROUND - o.h + 4, b: FIELD_H - GROUND };
        return dinoBox.l < cBox.r && dinoBox.r > cBox.l && dinoBox.t < cBox.b && dinoBox.b > cBox.t;
      });
      if (hit) {
        gameOver();
        return;
      }

      forceTick((t) => t + 1);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }

  // สุ่มสร้างแคคตัส (ลำเดียว/สูง/2-3 ลำ) + ระยะห่างสุ่มตามความเร็ว
  function spawnCactus(p: Phys) {
    const field = fieldRef.current;
    p.W = field?.clientWidth ?? p.W;
    const r = Math.random();
    const o: Obstacle =
      r < 0.32
        ? { x: p.W + 10, w: 20, h: 28, n: 1 }
        : r < 0.55
          ? { x: p.W + 10, w: 25.7, h: 38, n: 1 }
          : r < 0.82
            ? { x: p.W + 10, w: 43, h: 28, n: 2 }
            : { x: p.W + 10, w: 66, h: 28, n: 3 };
    p.obs.push(o);
    p.distSinceSpawn = 0;
    p.spawnGap = Math.max(
      (0.75 + Math.random()) * (p.speed + 160),
      p.speed * 0.62 + 90
    );
  }

  function startGame() {
    const field = fieldRef.current;
    physRef.current = freshPhys(field?.clientWidth ?? 340);
    setNewRecord(false);
    setPhase('playing');
    phaseRef.current = 'playing';
    sound('select');
    startLoop();
  }

  function gameOver() {
    stopLoop();
    const p = physRef.current;
    phaseRef.current = 'over';
    setPhase('over');
    sound('error');
    if (p.score > best) {
      setBest(p.score);
      setNewRecord(true);
      try {
        localStorage.setItem(DINO_BEST_KEY, String(p.score));
      } catch {
        // บันทึกไม่ได้ก็ข้าม
      }
      setTimeout(() => sound('success'), 320);
    }
    forceTick((t) => t + 1);
  }

  // กระโดด / เริ่มเกม / เล่นใหม่ (SPACE, ↑, W, แตะจอ)
  function jump() {
    if (phaseRef.current === 'idle') {
      startGame();
      return;
    }
    if (phaseRef.current === 'over') {
      startGame();
      return;
    }
    const p = physRef.current;
    if (p.y <= 0 && p.vy === 0) {
      p.vy = JUMP_V;
      p.y = 0.01;
      sound('select');
    }
  }

  // คีย์บอร์ด: SPACE / ↑ / W กระโดด (เปิดเฉพาะตอน popup เปิด)
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        jump();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, best]);

  if (!open) return null;

  const p = physRef.current;
  const legs = p.legFrame === 0 ? [...DINO_BASE, ...DINO_LEGS_A] : [...DINO_BASE, ...DINO_LEGS_B];

  return (
    <div
      className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="มินิเกมดีโน่รัน Chrome Dino"
      onClick={onClose}
    >
      <div
        className={`${skin.card} w-full max-w-sm shadow-2xl px-5 py-5`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* หัว popup */}
        <div className="flex justify-between items-center mb-1">
          <h2 className={`flex items-center gap-2 text-base font-extrabold ${skin.score}`}>
            <i className="fa-solid fa-dragon opacity-70"></i>
            ดีโน่รัน — หลบแคคตัส
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition flex items-center justify-center cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <p className={`text-[11px] font-semibold ${skin.sub} rounded-full px-2.5 py-1 inline-flex items-center gap-1`}>
          <i className="fa-solid fa-circle-info"></i>
          กด SPACE / ↑ หรือแตะจอ = กระโดด • ชนแคคตัส = จบเกม
        </p>

        {/* สถิติ */}
        <div aria-live="polite" className="mt-3 flex items-center justify-center gap-2 text-xs font-extrabold">
          <span className={`rounded-full px-2.5 py-1 ${skin.sub}`}>คะแนน: {p.score}</span>
          <span className={`rounded-full px-2.5 py-1 ${skin.sub}`}>🏆 สถิติสูงสุด: {best}</span>
        </div>

        {/* ===== พื้นที่เล่นเกม ===== */}
        <div
          ref={fieldRef}
          role="button"
          tabIndex={0}
          aria-label="พื้นที่เล่นเกมดีโน่รัน — แตะเพื่อกระโดด"
          onPointerDown={(e) => {
            e.preventDefault();
            jump();
          }}
          className="relative mt-3 h-44 overflow-hidden select-none touch-none cursor-pointer rounded-xl bg-white/50 ring-1 ring-black/10 dark:bg-black/30 dark:ring-white/10"
        >
          {/* เมฆพิกเซล */}
          {p.clouds.map((c, i) => (
            <PixelMap
              key={i}
              art={CLOUD_ART}
              className="absolute w-[24px] opacity-20"
              style={{ left: c.x, top: c.y, transform: 'scale(1.6)', color: 'currentColor' }}
            />
          ))}

          {/* จุดพื้นดินเลื่อน */}
          {p.dots.map((d, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute w-[3px] h-[3px] bg-current opacity-20"
              style={{ left: d, bottom: 3 + (i % 3) * 3 }}
            />
          ))}

          {/* เส้นพื้น */}
          <div aria-hidden="true" className="absolute left-0 right-0 bottom-[14px] h-[2px] bg-current opacity-30" />

          {/* ไดโนเสาร์ (สองเฟรมสลับขาวิ่ง) */}
          <div
            className="absolute text-gray-800 dark:text-gray-100"
            style={{ left: DINO_X, bottom: GROUND, width: DINO_W, transform: `translateY(${-p.y}px)` }}
          >
            <PixelMap art={legs} eyeCol="#9ca3af" className="w-full" />
          </div>

          {/* แคคตัสพิกเซล */}
          {p.obs.map((o, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="absolute flex items-end text-emerald-500"
              style={{ left: 0, bottom: GROUND, width: o.w, height: o.h, transform: `translateX(${o.x}px)` }}
            >
              {Array.from({ length: o.n }).map((_, k) => (
                <PixelMap
                  key={k}
                  art={CACTUS_ART}
                  className="h-full shrink-0"
                  style={{ width: o.n > 1 ? o.w / o.n - 1.5 : 'auto', aspectRatio: '10 / 14' }}
                />
              ))}
            </div>
          ))}

          {/* โอเวอร์เลย์เริ่มเกม */}
          {phase === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/25 backdrop-blur-[1px]">
              <span className="text-3xl" aria-hidden="true">🦖</span>
              <p className="text-sm font-black text-white drop-shadow">กด SPACE หรือแตะเพื่อเริ่ม</p>
              <p className="text-[11px] font-semibold text-white/80">กระโดดหลบแคคตัสให้ได้มากที่สุด!</p>
            </div>
          )}

          {/* โอเวอร์เลย์จบเกม */}
          {phase === 'over' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/35 backdrop-blur-[1px]">
              <p className="text-lg font-black text-white drop-shadow">จบเกม! ได้ {p.score} แต้ม</p>
              {newRecord && (
                <p className="text-sm font-black text-yellow-300 drop-shadow">สถิติใหม่! 🏆</p>
              )}
              <p className="text-[11px] font-semibold text-white/80">กด SPACE หรือแตะเพื่อเล่นใหม่</p>
            </div>
          )}
        </div>

        {/* ปุ่มควบคุม */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            type="button"
            onClick={startGame}
            title={phase === 'idle' ? 'เริ่มเกมดีโน่รัน' : 'เริ่มเกมใหม่'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95 cursor-pointer ${skin.flipBtn}`}
          >
            <i className={`fa-solid ${phase === 'idle' ? 'fa-play' : 'fa-rotate-right'}`}></i>
            {phase === 'idle' ? 'เริ่มเกม' : 'เริ่มใหม่'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition active:scale-95 cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
