'use client';

import { useState } from 'react';
import { RACKET_SKINS, SHOE_SKINS, SHOP_PRICE, type GearSkin } from '@/lib/gear';
import { GearPixel } from './gear-pixel';

type ShopTab = 'racket' | 'shoe';

// โมดอลร้านค้า: ปลดล็อคสกินไม้แบด/รองเท้าเท่ห์พิเศษ ราคา 100 เหรียญ/สกิน
// parent ใช้ key={shopOpen} เพื่อ remount → แท็บกลับเป็น "ไม้แบด" ทุกครั้งที่เปิด
export function ShopModal({
  open,
  playerName,
  coins,
  unlockedIds,
  onBuy,
  onClose,
}: {
  open: boolean;
  playerName: string; // เจ้าของร้าน — ใช้เหรียญรายบุคคลของคนนี้ซื้อ
  coins: number;
  unlockedIds: string[];
  onBuy: (gear: GearSkin) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<ShopTab>('racket');

  if (!open) return null;

  const items = (tab === 'racket' ? RACKET_SKINS : SHOE_SKINS).filter((g) => g.price > 0);

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="ร้านค้าสกินอุปกรณ์"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-gray-200/70 dark:ring-gray-700/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* หัวโมดอล */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-amber-50 via-white to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-lg shadow-lg shadow-amber-500/25 shrink-0">
              <i className="fa-solid fa-bag-shopping"></i>
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100 leading-tight">
                ร้านค้าสกินเท่ห์ — {playerName}
              </h2>
              <p className="text-xs text-gray-400">
                สกินพิเศษราคา {SHOP_PRICE} เหรียญ/สกิน • ใช้เหรียญรายบุคคลของ "{playerName}"
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:ring-amber-900 px-3 py-1.5 rounded-xl text-sm font-extrabold flex items-center gap-1.5"
              title={`เหรียญสะสมของ ${playerName}`}
            >
              <i className="fa-solid fa-coins"></i>
              {coins}
            </span>
            <button
              onClick={onClose}
              aria-label="ปิดร้านค้า"
              className="w-9 h-9 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition flex items-center justify-center"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* แท็บหมวด */}
        <div className="flex gap-2 px-5 pt-4 pb-1">
          {(
            [
              { key: 'racket', label: 'ไม้แบดเท่ห์', icon: 'fa-table-tennis-paddle-ball' },
              { key: 'shoe', label: 'รองเท้าเท่ห์', icon: 'fa-shoe-prints' },
            ] as { key: ShopTab; label: string; icon: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition ring-1 ${
                tab === t.key
                  ? 'bg-amber-500 text-white ring-amber-500 shadow-md shadow-amber-500/25'
                  : 'bg-gray-50 text-gray-500 ring-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700'
              }`}
            >
              <i className={`fa-solid ${t.icon} mr-1.5`}></i>
              {t.label} 10
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
                  className={`flex items-center gap-3 rounded-2xl p-3 ring-1 transition ${
                    owned
                      ? 'bg-emerald-50/60 ring-emerald-200 dark:bg-emerald-950/30 dark:ring-emerald-900'
                      : 'bg-white ring-gray-200 hover:ring-amber-300 dark:bg-gray-800 dark:ring-gray-700 dark:hover:ring-amber-700'
                  }`}
                >
                  <span className="w-16 h-16 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shrink-0">
                    <GearPixel gear={g} size={40} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-gray-800 dark:text-gray-100 text-sm truncate">
                      {g.name}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                      <i className="fa-solid fa-coins text-[10px]"></i>
                      {g.price} เหรียญ
                    </p>
                    {owned ? (
                      <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <i className="fa-solid fa-circle-check"></i> ปลดล็อคแล้ว
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onBuy(g)}
                        disabled={!affordable}
                        title={affordable ? `ปลดล็อค ${g.name}` : 'เหรียญไม่พอ — เก็บเหรียญเพิ่มจากการแข่งขัน'}
                        className={`mt-1.5 w-full text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                          affordable
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-[0.98]'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700/60 dark:text-gray-500'
                        }`}
                      >
                        <i className={`fa-solid ${affordable ? 'fa-unlock' : 'fa-lock'}`}></i>
                        {affordable ? 'ปลดล็อค' : `เหรียญไม่พอ (ต้องการ ${g.price - coins})`}
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
          <p className="text-[11px] text-gray-400 hidden sm:block">
            <i className="fa-solid fa-circle-info mr-1"></i>
            เก็บเหรียญจากการบันทึกผลแข่ง (รายบุคคล): ชนะ +3 เหรียญ • แพ้ +1 เหรียญ
          </p>
          <button
            onClick={onClose}
            className="ml-auto bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-xl font-semibold shadow transition text-sm"
          >
            ปิดร้าน
          </button>
        </div>
      </div>
    </div>
  );
}
