'use client';

import { useLang } from '@/lib/i18n';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  RACKET_SKINS,
  SHOE_SKINS,
  isGearLocked,
  SHOP_PRICE,
  type GearKind,
  type GearSkin,
} from '@/lib/gear';
import { GearPixel } from './gear-pixel';
import { ShuttlecockIcon } from './shuttlecock-icon';
import { PixelAvatar } from './pixel-avatar';
import type { Skin } from '@/lib/characters';
import type { HudSkin } from '@/lib/hud-skins';

const STEP = 64; // ความกว้างไอเทม (56px) + ช่องไฟ (8px)
const COPIES = 3; // จำนวนสำเนาแถบสกิน (หมุนวนได้ไม่รู้จบ)

// รีล 1 แถว: แถบสกินเลื่อนซ้าย-ขวา กดเลือกได้ + ปุ่มสุ่มแบบหมุนรีล
function ReelStrip({
  label,
  icon,
  items,
  currentId,
  unlockedIds,
  onPick,
  onLockedPick,
  onTick,
  hudSkin,
}: {
  label: string;
  icon: ReactNode;
  items: GearSkin[];
  currentId: string;
  unlockedIds: string[];
  onPick: (g: GearSkin) => void;
  onLockedPick: (g: GearSkin) => void;
  onTick: () => void;
  hudSkin: HudSkin;
}) {
  const { t } = useLang();
  const base = Math.max(0, items.findIndex((g) => g.id === currentId));
  const [pos, setPos] = useState(base + items.length); // เริ่มที่สำเนากลาง
  const [spinning, setSpinning] = useState(false);
  const [noTrans, setNoTrans] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const realIdx = ((pos % items.length) + items.length) % items.length;
  const current = items[realIdx];

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  function apply(g: GearSkin) {
    if (isGearLocked(g, unlockedIds)) onLockedPick(g);
    else onPick(g);
  }

  // กดเลือกไอเทมในแถบ → รีลเลื่อนมาหาไอเทมนั้น
  function moveTo(i: number) {
    if (spinning) return;
    setPos(i + items.length);
    apply(items[i]);
  }

  // ลูกศรซ้าย/ขวา → เลื่อนทีละช่อง
  function nudge(dir: 1 | -1) {
    if (spinning) return;
    const wrapped = (realIdx + dir + items.length) % items.length;
    const nextPos = pos + dir;
    if (nextPos < items.length || nextPos >= items.length * COPIES) {
      // ออกนอกแถบกลาง → วาร์ปกลับสำเนากลางแบบไม่มีแอนิเมชัน
      setNoTrans(true);
      setPos(wrapped + items.length);
      requestAnimationFrame(() => requestAnimationFrame(() => setNoTrans(false)));
    } else {
      setPos(nextPos);
    }
    apply(items[wrapped]);
  }

  // สุ่มแบบหมุนรีล
  function spin() {
    if (spinning) return;
    setSpinning(true);
    const total = 12 + Math.floor(Math.random() * 9);
    const target = Math.floor(Math.random() * items.length);
    let t = 0;
    timer.current = setInterval(() => {
      t++;
      if (t >= total) {
        if (timer.current) clearInterval(timer.current);
        setSpinning(false);
        setPos(target + items.length);
        apply(items[target]);
        return;
      }
      onTick();
      setPos((p) => p + 1);
    }, 65);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <span className="text-blue-500 inline-flex items-center">
            {icon}
          </span>
          {label}
          <span className="text-xs font-medium text-gray-400 truncate max-w-[180px]">
            • {current && t(current.name)}
          </span>
        </h3>
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition active:scale-95 disabled:opacity-60 disabled:cursor-wait flex items-center gap-1.5 ${hudSkin.btn}`}
        >
          <i className={`fa-solid ${spinning ? 'fa-arrows-spin fa-spin' : 'fa-dice'}`}></i>
          {spinning ? t('กำลังหมุน') : t('สุ่ม')}
        </button>
      </div>
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => nudge(-1)}
          disabled={spinning}
          aria-label={t('{label} ก่อนหน้า', { label })}
          className={`shrink-0 w-8 rounded-xl transition disabled:opacity-40 flex items-center justify-center ${hudSkin.chip}`}
        >
          <i className="fa-solid fa-chevron-left text-xs"></i>
        </button>
        <div className="relative flex-1 min-w-0 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-200 h-[76px] dark:bg-gray-800/60 dark:ring-gray-700">
          <div
            className="absolute left-1/2 top-1/2 flex items-center gap-2 will-change-transform"
            style={{
              transform: `translate(${-pos * STEP - 28}px, -50%)`,
              transition: spinning
                ? 'transform 65ms linear'
                : noTrans
                  ? 'none'
                  : 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {Array.from({ length: COPIES }, (_, c) =>
              items.map((g, i) => {
                const idx = c * items.length + i;
                const active = idx === pos;
                const locked = isGearLocked(g, unlockedIds);
                return (
                  <button
                    key={`${c}-${g.id}`}
                    type="button"
                    onClick={() => moveTo(i)}
                    title={locked ? t('{name} — ปลดล็อคที่ร้านค้า {price} เหรียญ', { name: t(g.name), price: SHOP_PRICE }) : t(g.name)}
                    aria-pressed={active}
                    className={`relative shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition ring-1 ${
                      active
                        ? `${hudSkin.card} ring-2 scale-105`
                        : locked
                          ? `${hudSkin.panelIcon} opacity-50 grayscale cursor-pointer`
                          : hudSkin.panelIcon
                    }`}
                  >
                    <GearPixel gear={g} size={38} />
                    {locked && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full bg-gray-700 text-white text-[8px] flex items-center justify-center shadow ring-1 ring-white">
                        <i className="fa-solid fa-lock"></i>
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => nudge(1)}
          disabled={spinning}
          aria-label={t('{label} ถัดไป', { label })}
          className={`shrink-0 w-8 rounded-xl transition disabled:opacity-40 flex items-center justify-center ${hudSkin.chip}`}
        >
          <i className="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </div>
    </div>
  );
}

// โมดอลตู้ Reel เปลี่ยนสกินไม้แบด + รองเท้าแบดของผู้เล่น 1 คน
// parent ใช้ key={slot} เพื่อ remount ให้รีลกลับตำแหน่งสกินปัจจุบันทุกครั้งที่เปิด
// การเปลี่ยนสกินที่นี่จะบันทึกเป็นค่าเริ่มต้นของผู้เล่นคนนั้น
export function SkinReel({
  open,
  slotLabel,
  playerName,
  skin,
  currentRacketId,
  currentShoeId,
  coins,
  unlockedIds,
  onPick,
  onLockedPick,
  onOpenShop,
  onClose,
  onTick,
  hudSkin,
}: {
  open: boolean;
  slotLabel: string;
  playerName: string;
  skin?: Skin;
  currentRacketId: string;
  currentShoeId: string;
  coins: number; // เหรียญรายบุคคลของเจ้าของรีล
  unlockedIds: string[]; // สกินร้านค้าที่เจ้าของรีลปลดล็อคแล้ว
  onPick: (kind: GearKind, gear: GearSkin) => void;
  onLockedPick: (gear: GearSkin) => void;
  onOpenShop: () => void;
  onClose: () => void;
  onTick: () => void;
  hudSkin: HudSkin;
}) {
  const { t } = useLang();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('ตู้ Reel เปลี่ยนสกินอุปกรณ์')}
      onClick={onClose}
    >
      <div
        className={`${hudSkin.modalCard} w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden ring-1`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* หัวโมดอล */}
        <div className={`flex justify-between items-center px-5 py-4 border-b ${hudSkin.page}`}>
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${hudSkin.panelIcon}`}>
              {skin && <PixelAvatar skin={skin} size={32} />}
            </span>
            <div className="min-w-0">
              <h2 className={`text-lg font-bold leading-tight ${hudSkin.heading}`}>
                {t('ตู้ Reel — {name}', { name: playerName })}
              </h2>
              <p className="text-xs text-gray-400 truncate">
                {t('{slotLabel} • สกินที่เลือกจะบันทึกเป็นของผู้เล่นคนนี้', { slotLabel })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2.5 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 ${hudSkin.coin}`}
              title={t('เหรียญสะสมของ {name}', { name: playerName })}
            >
              <i className="fa-solid fa-coins"></i>
              {coins}
            </span>
            <button
              onClick={onOpenShop}
              aria-label={t('เปิดร้านค้าสกินของผู้เล่นนี้')}
              title={t('ร้านค้าสกินเท่ห์ — ปลดล็อคด้วยเหรียญของผู้เล่นคนนี้')}
              className={`px-3 py-2 rounded-xl font-bold transition text-xs flex items-center gap-1.5 ${hudSkin.btn}`}
            >
              <i className="fa-solid fa-bag-shopping"></i>
              <span className="hidden sm:inline">{t('ร้านค้า')}</span>
            </button>
          </div>
          <button
            onClick={onClose}
            aria-label={t('ปิดตู้เปลี่ยนสกินอุปกรณ์')}
            className={`w-9 h-9 rounded-xl transition flex items-center justify-center shrink-0 ${hudSkin.chip}`}
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* รีลสองแถว */}
        <div className="overflow-y-auto p-5 space-y-6">
          <ReelStrip
            label={t('ไม้แบด')}
            icon={<ShuttlecockIcon className="w-4 h-4" />}
            items={RACKET_SKINS}
            currentId={currentRacketId}
            unlockedIds={unlockedIds}
            onPick={(g) => onPick('racket', g)}
            onLockedPick={onLockedPick}
            onTick={onTick}
            hudSkin={hudSkin}
          />
          <ReelStrip
            label={t('รองเท้าแบด')}
            icon={<i className="fa-solid fa-shoe-prints" />}
            items={SHOE_SKINS}
            currentId={currentShoeId}
            unlockedIds={unlockedIds}
            onPick={(g) => onPick('shoe', g)}
            onLockedPick={onLockedPick}
            onTick={onTick}
            hudSkin={hudSkin}
          />
          <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <i className="fa-solid fa-circle-info"></i>
            {t('สกินที่มีสัญลักษณ์กุญแจคือสกินเท่ห์พิเศษจากร้านค้า — แตะเพื่อไปปลดล็อคที่ร้านค้า ({price} เหรียญ/สกิน)', { price: SHOP_PRICE })}
          </p>
        </div>

        {/* ท้ายโมดอล */}
        <div className={`px-5 py-3.5 border-t flex items-center justify-between gap-3 ${hudSkin.page}`}>
          <p className="text-[11px] text-gray-400 hidden sm:block">
            <i className="fa-solid fa-shirt mr-1"></i>
            {t('สกินอุปกรณ์เป็นแค่ลุค — สถิติการเล่นไม่เปลี่ยนตาม')}
          </p>
          <button
            onClick={onClose}
            className={`ml-auto px-5 py-2 rounded-xl font-semibold transition text-sm ${hudSkin.chip}`}
          >
            {t('ยกเลิก')}
          </button>
        </div>
      </div>
    </div>
  );
}
