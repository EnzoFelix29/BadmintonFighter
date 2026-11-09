'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { RACKET_SKINS, SHOE_SKINS, SHOP_PRICE, type GearSkin } from '@/lib/gear';
import { useLang } from '@/lib/i18n';
import { GearPixel } from './gear-pixel';
import { ShuttlecockIcon } from './shuttlecock-icon';
import type { HudSkin } from '@/lib/hud-skins';

type ShopTab = 'racket' | 'shoe';

// โมดอลร้านค้า: ปลดล็อคสกินไม้แบด/รองเท้าเท่ห์พิเศษ ราคา 100 เหรียญ/สกิน
// parent ใช้ key={shopOpen} เพื่อ remount → แท็บกลับเป็น "ไม้แบด" ทุกครั้งที่เปิด
export function ShopModal({
  open,
  playerName,
  coins,
  unlockedIds,
  skin,
  onBuy,
  onClose,
}: {
  open: boolean;
  playerName: string; // เจ้าของร้าน — ใช้เหรียญรายบุคคลของคนนี้ซื้อ
  coins: number;
  unlockedIds: string[];
  skin: HudSkin;
  onBuy: (gear: GearSkin) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<ShopTab>('racket');
  const { t } = useLang();

  if (!open) return null;

  const items = (tab === 'racket' ? RACKET_SKINS : SHOE_SKINS).filter((g) => g.price > 0);

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('ร้านค้าสกินอุปกรณ์')}
      onClick={onClose}
    >
      <div
        className={`${skin.modalCard} w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* หัวโมดอล */}
        <div className={`flex justify-between items-center px-5 py-4 border-b border-gray-200 ${skin.page}`}>
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${skin.panelIcon}`}>
              <i className="fa-solid fa-bag-shopping"></i>
            </span>
            <div className="min-w-0">
              <h2 className={`text-lg font-semibold leading-tight ${skin.heading}`}>
                {t('ร้านค้าสกินเท่ห์ — {name}', { name: playerName })}
              </h2>
              <p className="text-xs text-gray-400">
                {t('สกินพิเศษราคา {price} เหรียญ/สกิน • ใช้เหรียญรายบุคคลของ "{name}"', {
                  price: SHOP_PRICE,
                  name: playerName,
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`${skin.chip} px-3 py-1.5 rounded-lg text-sm font-medium tabular-nums flex items-center gap-1.5`}
              title={t('เหรียญสะสมของ {name}', { name: playerName })}
            >
              <i className="fa-solid fa-coins"></i>
              {coins}
            </span>
            <button
              onClick={onClose}
              aria-label={t('ปิดร้านค้า')}
              className={`w-9 h-9 rounded-lg transition-colors flex items-center justify-center ${skin.chip}`}
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* แท็บหมวด */}
        <div className="flex gap-2 px-5 pt-4 pb-1">
          {(
            [
              { key: 'racket', label: t('ไม้แบดเท่ห์'), icon: <ShuttlecockIcon className="w-3.5 h-3.5" /> },
              { key: 'shoe', label: t('รองเท้าเท่ห์'), icon: <i className="fa-solid fa-shoe-prints" /> },
            ] as { key: ShopTab; label: string; icon: ReactNode }[]
          ).map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === tb.key ? skin.btn : skin.chip
              }`}
            >
              {tb.icon}
              {tb.label} {(tb.key === 'racket' ? RACKET_SKINS : SHOE_SKINS).filter((g) => g.price > 0).length}
            </button>
          ))}
        </div>

        {/* กริดสินค้า */}
        <div className="overflow-y-auto p-5 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((g) => {
              const owned = unlockedIds.includes(g.id);
              const affordable = coins >= g.price;
              return (
                <div
                  key={g.id}
                  className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${skin.card} ${owned ? 'ring-2 ring-emerald-500/35' : ''}`}
                >
                  <span className={`w-16 h-16 rounded-lg flex items-center justify-center shrink-0 ${skin.panelIcon}`}>
                    <GearPixel gear={g} size={40} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">
                      {t(g.name)}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                      <i className="fa-solid fa-coins text-xs"></i>
                      {t('{n} เหรียญ', { n: g.price })}
                    </p>
                    {owned ? (
                      <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <i className="fa-solid fa-circle-check"></i> {t('ปลดล็อคแล้ว')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onBuy(g)}
                        disabled={!affordable}
                        title={
                          affordable
                            ? t('ปลดล็อค {name}', { name: t(g.name) })
                            : t('เหรียญไม่พอ — เก็บเหรียญเพิ่มจากการแข่งขัน')
                        }
                        className={`mt-1.5 w-full text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                          affordable
                            ? `${skin.btn} active:scale-[0.98]`
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700/60 dark:text-gray-500'
                        }`}
                      >
                        <i className={`fa-solid ${affordable ? 'fa-unlock' : 'fa-lock'}`}></i>
                        {affordable ? t('ปลดล็อค') : t('เหรียญไม่พอ (ต้องการ {n})', { n: g.price - coins })}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ท้ายโมดอล */}
        <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-400 hidden sm:block">
            <i className="fa-solid fa-circle-info mr-1"></i>
            {t('เก็บเหรียญจากการบันทึกผลแข่ง (รายบุคคล): ชนะ +7 เหรียญ • แพ้ +3 เหรียญ')}
          </p>
          <button
            onClick={onClose}
            className="ml-auto bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-xl font-semibold shadow transition text-sm"
          >
            {t('ปิดร้าน')}
          </button>
        </div>
      </div>
    </div>
  );
}
