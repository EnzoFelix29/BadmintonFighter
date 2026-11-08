'use client';

import { useEffect, useState } from 'react';
import type { HudSkin } from '@/lib/hud-skins';

type SoundFn = (kind: 'success' | 'error' | 'open' | 'clear' | 'select' | 'tick') => void;

// ============================================================
// มินิเกม HI-LO — ทายว่าไพ่ใบต่อไป "สูงกว่า" หรือ "ต่ำกว่า"
// A ต่ำสุด (1) → K สูงสุด (13) • แต้มเท่ากับ = แพ้
// ทายถูก = สตรีค +1 ไปเรื่อย ๆ / ทายผิด = จบเกม
// สถิติสูงสุดเก็บใน localStorage: badminton_hilo_best
// ไพ่เป็นสไตล์พิกเซล 8-บิต วาดสัญลักษณ์ดอกจากแผนที่พิกเซล
// ============================================================

const HILO_BEST_KEY = 'badminton_hilo_best';
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface Card {
  rank: number; // 1 = A … 13 = K
  suit: number; // 0 = ♥ 1 = ♦ 2 = ♣ 3 = ♠
}

function draw(): Card {
  return {
    rank: 1 + Math.floor(Math.random() * 13),
    suit: Math.floor(Math.random() * 4),
  };
}

// แผนที่พิกเซลสัญลักษณ์ไพ่ (7 คอลัมน์) — '.' = โปร่ง
const SUIT_ART: string[][] = [
  // ♥ หัวใจ
  ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
  // ♦ ข้าวหลามตัด
  ['...X...', '..XXX..', '.XXXXX.', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
  // ♣ โพธิ์ดำ
  ['..XXX..', '.XXXXX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '...X...', '..XXX..'],
  // ♠ โพธิ์แดง
  ['...X...', '..XXX..', '.XXXXX.', 'XXXXXXX', '.XXXXX.', '...X...', '..XXX..'],
];
const SUIT_RED = [true, true, false, false];

function SuitArt({ suit, className }: { suit: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 7 7"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {SUIT_ART[suit].map((row, y) =>
        [...row].map((ch, x) =>
          ch === 'X' ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill="currentColor" />
          ) : null
        )
      )}
    </svg>
  );
}

// ไพ่พิกเซลใบเดียว (ใหญ่ = ไพ่ปัจจุบัน, เล็ก = ไพ่เก่าในเทรล)
function PixelCard({ card, big, flipKey }: { card: Card; big?: boolean; flipKey?: number }) {
  const color = SUIT_RED[card.suit] ? 'text-rose-600' : 'text-gray-900';
  return (
    <div
      key={flipKey}
      className={`bg-white border-4 border-gray-800 rounded-lg shadow-lg relative inline-flex flex-col items-center justify-center select-none ${
        big
          ? `w-28 h-40 ${color} animate-hiloflip`
          : `w-9 h-14 ${color}`
      } ${big ? '' : 'border-2 rounded-md shadow-sm'}`}
    >
      {big ? (
        <>
          <span className="absolute top-1.5 left-2 text-xl font-black leading-none">{RANKS[card.rank - 1]}</span>
          <span className="absolute bottom-1.5 right-2 text-xl font-black leading-none rotate-180">
            {RANKS[card.rank - 1]}
          </span>
          <SuitArt suit={card.suit} className="w-10 h-10" />
        </>
      ) : (
        <>
          <span className="text-[10px] font-black leading-none">{RANKS[card.rank - 1]}</span>
          <SuitArt suit={card.suit} className="w-3.5 h-3.5 mt-0.5" />
        </>
      )}
    </div>
  );
}

export function HiLoGameModal({
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
  const [card, setCard] = useState<Card>({ rank: 7, suit: 0 }); // ไพ่ปัจจุบัน
  const [started, setStarted] = useState(false); // กดเริ่มเกมแล้ว (สุ่มไพ่จริง)
  const [streak, setStreak] = useState(0); // ทายถูกต่อกันกี่ครั้ง
  const [best, setBest] = useState(0); // สถิติสูงสุด
  const [over, setOver] = useState(false); // ทายผิด = จบเกม
  const [trail, setTrail] = useState<Card[]>([]); // ไพ่ก่อนหน้า (สูงสุด 6 ใบ)
  const [flipKey, setFlipKey] = useState(0); // เปลี่ยน key = เล่น animation พลิกใหม่

  // โหลดสถิติสูงสุดตอนเปิด popup
  useEffect(() => {
    if (!open) return;
    try {
      setBest(parseInt(localStorage.getItem(HILO_BEST_KEY) || '0', 10) || 0);
    } catch {
      // ไม่มี localStorage ข้าม
    }
  }, [open]);

  // ทาย hi (สูงกว่า) / lo (ต่ำกว่า) — เท่ากับ = แพ้
  function guess(dir: 'hi' | 'lo') {
    if (over || !started) return;
    const next = draw();
    const win = dir === 'hi' ? next.rank > card.rank : next.rank < card.rank;
    setTrail((t) => [...t.slice(-5), card]);
    setCard(next);
    setFlipKey((k) => k + 1);
    if (win) {
      sound('success');
      setStreak((s) => {
        const ns = s + 1;
        if (ns > best) {
          setBest(ns);
          try {
            localStorage.setItem(HILO_BEST_KEY, String(ns));
          } catch {
            // บันทึกไม่ได้ก็ข้าม
          }
        }
        return ns;
      });
    } else {
      sound('error');
      setOver(true);
    }
  }

  // เริ่มเกม / เล่นใหม่: สุ่มไพ่ใหม่ ล้างสตรีค
  function restart() {
    sound('select');
    setCard(draw());
    setStarted(true);
    setStreak(0);
    setOver(false);
    setTrail([]);
    setFlipKey((k) => k + 1);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="มินิเกม HI-LO"
      onClick={over ? onClose : undefined}
    >
      <div
        className={`${skin.card} w-full max-w-sm shadow-2xl px-5 py-5`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* หัว popup */}
        <div className="flex justify-between items-center mb-1">
          <h2 className={`flex items-center gap-2 text-base font-extrabold ${skin.score}`}>
            <i className="fa-solid fa-spade opacity-70"></i>
            HI-LO ทายไพ่สูง-ต่ำ
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
          A ต่ำสุด • K สูงสุด • แต้มเท่ากับ = แพ้
        </p>

        {/* สถิติ */}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs font-extrabold">
          <span className={`rounded-full px-2.5 py-1 ${skin.sub}`}>ต่อปัจจุบัน: {streak}</span>
          <span className={`rounded-full px-2.5 py-1 ${skin.sub}`}>🏆 สถิติสูงสุด: {best}</span>
        </div>

        {/* ไพ่ปัจจุบัน */}
        <div aria-live="polite" className="flex flex-col items-center pt-5 pb-2">
          <div className="rounded-2xl ring-2 ring-black/10 bg-white/40 dark:bg-black/30 dark:ring-white/10 px-8 py-5">
            {started ? (
              <PixelCard card={card} big flipKey={flipKey} />
            ) : (
              <div className="w-28 h-40 rounded-lg border-4 border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl select-none">
                ❓
              </div>
            )}
          </div>

          {/* ข้อความสถานะ */}
          <div className="mt-3 text-center min-h-[3rem]">
            {!started ? (
              <p className={`text-sm font-bold ${skin.score}`}>กด &quot;เริ่มเกม&quot; เพื่อสุ่มไพ่ใบแรก</p>
            ) : over ? (
              <>
                <p className="text-lg font-black text-rose-500">แพ้! ทายถูก {streak} ต่อ</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {streak >= best && streak > 0 ? 'สถิติใหม่! 🏆' : 'ลองใหม่ คราวนี้ต้องไปไกลกว่านี้'}
                </p>
              </>
            ) : (
              <p className={`text-sm font-bold ${skin.score}`}>
                ไพ่ต่อไปจะ <span className="text-emerald-500">สูงกว่า</span> หรือ{' '}
                <span className="text-sky-500">ต่ำกว่า</span>?
              </p>
            )}
          </div>
        </div>

        {/* ไพ่เก่า (เทรล) */}
        {trail.length > 0 && (
          <div className="flex gap-1.5 justify-center flex-wrap mt-1" aria-label="ไพ่ก่อนหน้า">
            {trail.map((c, i) => (
              <PixelCard key={i} card={c} />
            ))}
          </div>
        )}

        {/* ปุ่มทาย HI / LO */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={() => guess('lo')}
            disabled={over || !started}
            title="ทายว่าไพ่ต่อไปต่ำกว่า (LO)"
            className={`inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-black transition active:scale-95 disabled:opacity-50 cursor-pointer ${skin.flipBtn}`}
          >
            <i className="fa-solid fa-arrow-down"></i> ต่ำ (LO)
          </button>
          <button
            type="button"
            onClick={() => guess('hi')}
            disabled={over || !started}
            title="ทายว่าไพ่ต่อไปสูงกว่า (HI)"
            className={`inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-black transition active:scale-95 disabled:opacity-50 cursor-pointer ${skin.flipBtn}`}
          >
            <i className="fa-solid fa-arrow-up"></i> สูง (HI)
          </button>
        </div>

        {/* ปุ่มควบคุม */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            type="button"
            onClick={restart}
            title={started ? 'เริ่มเกมใหม่ สุ่มไพ่ใหม่ทั้งหมด' : 'เริ่มเกม — สุ่มไพ่ใบแรก'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95 cursor-pointer ${skin.flipBtn}`}
          >
            <i className={`fa-solid ${started ? 'fa-rotate-right' : 'fa-play'}`}></i>
            {started ? 'เริ่มใหม่' : 'เริ่มเกม'}
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
