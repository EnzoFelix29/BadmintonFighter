'use client';

import { useLang } from '@/lib/i18n';
import { useEffect, useRef, useState } from 'react';
import type { HudSkin } from '@/lib/hud-skins';
import {
  PixelCrocLower,
  PixelCrocUpper,
  PixelHand,
  PixelTooth,
  PixelTongue,
} from '@/components/pixel-croc';

type SoundFn = (kind: 'success' | 'error' | 'open' | 'clear' | 'select' | 'tick') => void;

// ============================================================
// มินิเกมจระเข้กดนิ้ว (Crocodile Dentist แบบ 8-บิต)
// อ้างอิงของเล่นจระเข้กัดนิ้ว: ตัวเขียว ปากอ้ากว้าง ช่องปากแดง
// ฟันขาว 2 แถว (บน 8 + ล่าง 8 = รวม 16 ซี่) ผลัดกันกดทีละซี่
// กดฟันแล้วมีมือพิกเซลกด + เสียง "Ka!" สีสันตามรูปต้นแบบ
// ฟันเสียสุ่ม 1 ซี่ ใครกดโดน = ปากกระแทกปิด + CHOMP! + ตาหลับ
// ============================================================

const TOP_TEETH = 8; // ฟันแถวบน (ห้อยลง)
const BOTTOM_TEETH = 8; // ฟันแถวล่าง (ตั้งขึ้น)
const TEETH = TOP_TEETH + BOTTOM_TEETH;
const PLAYER_CHOICES = [2, 3, 4, 5, 6, 8];
// สีตัวอักษร Ka! ตามรูปต้นแบบ: น้ำเงิน เขียว ส้ม เหลืองเขียว
const KA_COLORS = ['#1e88e5', '#43a047', '#fb8c00', '#c0ca33'];

type KaPop = {
  id: number;
  tooth: number;
  color: string;
  dx: number;
  rot: number;
};

export function CrocGameModal({
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
  const { t } = useLang();
  const [playerCount, setPlayerCount] = useState(4); // จำนวนผู้เล่น
  const [turn, setTurn] = useState(0); // ตาของผู้เล่น index ปัจจุบัน
  const [sore, setSore] = useState(6); // ฟันเสีย (สุ่มใหม่ตอนเปิด popup)
  const [started, setStarted] = useState(false);
  const [pressed, setPressed] = useState<number[]>([]); // ฟันที่กดไปแล้ว
  const [bitten, setBitten] = useState<number | null>(null); // ผู้เล่นที่โดนกัด
  const [hand, setHand] = useState<{ tooth: number; key: number } | null>(null); // มือที่กำลังกดฟัน
  const [pops, setPops] = useState<KaPop[]>([]); // ตัวอักษร Ka! เด้ง ๆ
  const handTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popId = useRef(0);

  // ล้าง timer ตอน unmount
  useEffect(() => {
    return () => {
      if (handTimer.current) clearTimeout(handTimer.current);
    };
  }, []);

  // เปิด popup ทุกครั้ง = รอบใหม่ สุ่มฟันเสียซี่ใหม่
  useEffect(() => {
    if (!open) return;
    setSore(Math.floor(Math.random() * TEETH));
    setPressed([]);
    setBitten(null);
    setHand(null);
    setPops([]);
    setStarted(true);
  }, [open]);

  // เริ่มรอบใหม่: สุ่มฟันเสียซี่ใหม่ (เก็บตาผู้เล่นถัดไปไว้ได้)
  function newRound(keepTurn: boolean) {
    setSore(Math.floor(Math.random() * TEETH));
    setPressed([]);
    setBitten(null);
    setHand(null);
    setPops([]);
    setStarted(true);
    if (!keepTurn) setTurn(0);
  }

  // เปลี่ยนจำนวนผู้เล่น = เริ่มเกมใหม่ตั้งแต่ผู้เล่น 1
  function changePlayerCount(n: number) {
    setPlayerCount(n);
    setTurn(0);
    setSore(Math.floor(Math.random() * TEETH));
    setPressed([]);
    setBitten(null);
    setHand(null);
    setPops([]);
    setStarted(true);
    sound('select');
  }

  // สุ่มตัวอักษร Ka! ใกล้ฟันที่เพิ่งกด (เด้ง 2 ตัวจังหวะต่างกันแบบรูปต้นแบบ)
  function spawnKa(tooth: number) {
    const base = ++popId.current;
    const news: KaPop[] = [0, 1].map((k) => ({
      id: base + k,
      tooth,
      color: KA_COLORS[(base + k) % KA_COLORS.length],
      dx: Math.round((Math.random() * 44 + 18) * (Math.random() < 0.5 ? -1 : 1)),
      rot: Math.round(Math.random() * 22 - 11),
    }));
    setPops((p) => [...p, news[0]]);
    setTimeout(() => setPops((p) => [...p, news[1]]), 140);
    setTimeout(() => setPops((p) => p.filter((x) => !news.some((n) => n.id === x.id))), 1000);
  }

  // กดฟันซี่ที่ i — ถ้าเจอฟันเสีย = โดนกัด
  function pressTooth(i: number) {
    if (bitten !== null || !started || pressed.includes(i)) return;
    setPressed((p) => [...p, i]);
    setHand({ tooth: i, key: Date.now() });
    if (handTimer.current) clearTimeout(handTimer.current);
    if (i === sore) {
      sound('error'); // เสียงปากกระแทก!
      setPops([]); // เคลียร์ Ka! เหลือแค่ CHOMP!
      setBitten(turn);
      setTurn((t) => (t + 1) % playerCount); // รอบถัดไปเริ่มผู้เล่นคนถัดไป
    } else {
      sound('tick'); // เสียงกดฟัน Ka!
      spawnKa(i);
      setTurn((t) => (t + 1) % playerCount);
      handTimer.current = setTimeout(() => setHand(null), 900);
    }
  }

  if (!open) return null;

  const isBitten = bitten !== null;
  const remaining = TEETH - pressed.length;

  // สถานะฟันซี่ที่ i
  function toothVariant(i: number): 'normal' | 'pressed' | 'sore' {
    if (isBitten && i === sore) return 'sore';
    if (pressed.includes(i)) return 'pressed';
    return 'normal';
  }

  // ฟันซี่ที่ i ในแถว row — มีมือกด + ตัวอักษร Ka! ใน wrapper เดียวกัน
  function renderTooth(i: number, row: 'top' | 'bottom') {
    const variant = toothVariant(i);
    const isPressed = pressed.includes(i);
    const isHandHere = hand?.tooth === i;
    return (
      <div key={i} className="relative w-[10.5%] h-full">
        <button
          type="button"
          onClick={() => pressTooth(i)}
          disabled={isBitten || !started || isPressed}
          title={
            isPressed
              ? t('ฟันซี่ที่ {n} (กดแล้ว — ปลอดภัย)', { n: i + 1 })
              : t('ฟันซี่ที่ {n} — กดเลย!', { n: i + 1 })
          }
          aria-label={t('ฟันซี่ที่ {n}', { n: i + 1 }) + (isPressed ? t(' (กดแล้ว)') : '')}
          className={`w-full h-full flex justify-center transition-transform cursor-pointer disabled:cursor-default ${
            row === 'top' ? 'items-start' : 'items-end'
          } ${!isPressed && !isBitten ? 'active:scale-95 hover:brightness-110' : ''}`}
        >
          <PixelTooth
            variant={variant}
            dir={row === 'top' ? 'down' : 'up'}
            className={variant === 'pressed' ? 'h-[44%] w-auto' : 'h-[94%] w-auto'}
          />
        </button>
        {/* มือพิกเซลกดนิ้ว — แถวบน: มือล่างชี้ขึ้น / แถวล่าง: มือบนชี้ลง */}
        {isHandHere && (
          <div
            key={hand?.key}
            className={`pointer-events-none absolute left-1/2 -translate-x-1/2 z-30 ${
              row === 'top' ? 'top-[102%]' : 'bottom-[86%]'
            }`}
          >
            <PixelHand
              flip={row === 'top'}
              className={`h-[46px] w-auto ${isBitten ? 'animate-crocshake' : 'animate-handpress'}`}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('มินิเกมจระเข้กดนิ้ว')}
      onClick={isBitten ? onClose : undefined}
    >
      <div
        className={`${skin.card} w-full max-w-sm shadow-2xl px-5 py-5`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* หัว popup */}
        <div className="flex justify-between items-center mb-1">
          <h2 className={`flex items-center gap-2 text-base font-extrabold ${skin.score}`}>
            <i className="fa-solid fa-teeth-open opacity-70"></i>
            {t('จระเข้กดนิ้ว')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('ปิดหน้าต่าง')}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition flex items-center justify-center cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <p
          className={`text-[11px] font-semibold ${skin.sub} rounded-full px-2.5 py-1 inline-flex items-center gap-1`}
        >
          <i className="fa-solid fa-hand-pointer"></i>
          {t('ผลัดกันกดฟัน — ซี่ไหนเจอฟันเสียจะโดนกัด!')}
        </p>

        {/* เลือกจำนวนผู้เล่น */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <span className={`text-[11px] font-bold ${skin.score}`}>{t('ผู้เล่น:')}</span>
          {PLAYER_CHOICES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => changePlayerCount(n)}
              title={t('ตั้งผู้เล่น {n} คน (เริ่มเกมใหม่)', { n })}
              className={`h-7 px-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                playerCount === n
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-black/10 text-gray-500 hover:bg-black/20 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* ป้ายตาผู้เล่น + จุดผลัด */}
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
          <p aria-live="polite" className={`text-sm font-extrabold ${skin.score}`}>
            {isBitten ? t('🐊 จระเข้กัด! ผู้เล่น ') : t('ตาของ: ')}
            {isBitten ? (
              <span className="text-rose-500">{(bitten ?? 0) + 1}</span>
            ) : (
              <span className="text-emerald-500">{turn + 1}</span>
            )}
            {isBitten ? t(' โดนกัดนิ้ว!') : t(' (มี {n} คน)', { n: playerCount })}
          </p>
          <div className="flex items-center gap-1" aria-hidden="true">
            {Array.from({ length: playerCount }).map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  isBitten && i === bitten
                    ? 'bg-rose-500 scale-125'
                    : i === turn
                      ? 'bg-emerald-500 scale-125'
                      : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ===== เวทีจระเข้พิกเซล 8-บิต ===== */}
        <div className="mt-3 rounded-2xl border-[3px] border-[#14532d] bg-gradient-to-b from-[#9fe2df] via-[#bfe8c6] to-[#dce8a4] px-3 pt-3 pb-2">
          <div
            className={`relative w-full max-w-[300px] mx-auto select-none ${
              isBitten ? 'animate-crocshake' : ''
            }`}
          >
            {/* ขากรรไกรบน + ตา (โดนกัด = หลับตา + กระแทกลง) */}
            <div className={`relative z-20 ${isBitten ? 'animate-crocbitetop' : ''}`}>
              <PixelCrocUpper squint={isBitten} className="w-full" />
            </div>

            {/* ช่องปาก: แดงเข้ม + ลิ้น + ฟัน 2 แถว */}
            <div
              className={`relative h-[88px] bg-[#8f1d1d] border-x-[5px] border-[#14532d] ${
                isBitten ? 'animate-crocmouthclose' : ''
              }`}
            >
              {/* เงาเพดานปาก */}
              <div className="absolute inset-x-0 top-0 h-[7px] bg-[#6d1414]" aria-hidden="true" />
              {/* ลิ้นพิกเซลกลางปาก */}
              <PixelTongue className="absolute left-1/2 -translate-x-1/2 bottom-[34%] w-[64px] h-auto z-[5]" />
              {/* ฟันแถวบน 8 ซี่ (ห้อยลง) */}
              <div className="absolute top-0 left-[6%] right-[6%] h-[36%] flex justify-between z-10">
                {Array.from({ length: TOP_TEETH }).map((_, k) => renderTooth(k, 'top'))}
              </div>
              {/* ฟันแถวล่าง 8 ซี่ (ตั้งขึ้น) */}
              <div className="absolute bottom-0 left-[6%] right-[6%] h-[36%] flex justify-between z-10">
                {Array.from({ length: BOTTOM_TEETH }).map((_, k) =>
                  renderTooth(TOP_TEETH + k, 'bottom'),
                )}
              </div>
            </div>

            {/* ขากรรไกรล่าง (โดนกัด = กระแทกขึ้น) */}
            <div className={`relative z-20 ${isBitten ? 'animate-crocbitebottom' : ''}`}>
              <PixelCrocLower className="w-full" />
            </div>

            {/* คำเสียงตอนกัด */}
            {isBitten && (
              <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                <span
                  className="font-mono font-black text-3xl text-[#ffe082] animate-foodpop select-none"
                  style={{
                    textShadow:
                      '3px 3px 0 #7f1d1d, -2px -2px 0 #7f1d1d, 2px -2px 0 #7f1d1d, -2px 2px 0 #7f1d1d',
                  }}
                >
                  CHOMP!
                </span>
              </div>
            )}

            {/* เสียง Ka! เด้ง ๆ — วางที่ระดับ stage (z-40 เหนือขากรรไกร z-20)
                ถ้าวางในแถวฟัน (z-10) จะถูกขากรรไกรทับซ่อนไป */}
            {!isBitten &&
              pops.map((p) => {
                const k = p.tooth < TOP_TEETH ? p.tooth : p.tooth - TOP_TEETH; // ลำดับในแถว 0-5
                const xPct = 6 + (k + 0.5) * (88 / TOP_TEETH); // กลางฟันซี่นั้น
                const isTop = p.tooth < TOP_TEETH;
                return (
                  <div
                    key={p.id}
                    aria-hidden="true"
                    className="pointer-events-none absolute z-40"
                    style={{
                      left: `${xPct}%`,
                      ...(isTop ? { bottom: '13%' } : { top: '16%' }),
                      transform: `translateX(calc(-50% + ${p.dx}px)) rotate(${p.rot}deg)`,
                    }}
                  >
                    <span
                      className="block font-mono font-black text-2xl animate-kapop select-none"
                      style={{
                        color: p.color,
                        textShadow:
                          '2px 2px 0 #14532d, -1px -1px 0 #14532d, 1px -1px 0 #14532d, -1px 1px 0 #14532d',
                      }}
                    >
                      Ka!
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* สถานะรอบ */}
        <p
          aria-live="polite"
          className={`text-center text-xs font-semibold ${skin.sub} rounded-full px-2.5 py-1 inline-flex mx-auto mt-3`}
        >
          {isBitten
            ? t('กดไป {pressed}/{total} ซี่ • กด "รอบใหม่" เล่นต่อได้เลย', {
                pressed: pressed.length,
                total: TEETH,
              })
            : t('กดไปแล้ว {pressed}/{total} ซี่ — เหลืออีก {remaining} ซี่ 🦷', {
                pressed: pressed.length,
                total: TEETH,
                remaining,
              })}
        </p>

        {/* ปุ่มควบคุม */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => {
              sound('select');
              newRound(true);
            }}
            title={t('สุ่มฟันเสียซี่ใหม่ เริ่มรอบใหม่')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95 cursor-pointer ${skin.flipBtn}`}
          >
            <i className="fa-solid fa-rotate-right"></i>
            {t('รอบใหม่')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition active:scale-95 cursor-pointer"
          >
            {t('ปิด')}
          </button>
        </div>
      </div>
    </div>
  );
}
