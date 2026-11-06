'use client';

import { useState } from 'react';
import type { PlayerProfile } from '@/lib/players';
import type { HudSkin } from '@/lib/hud-skins';
import { getSkin } from '@/lib/characters';
import { getGear } from '@/lib/gear';
import { GearPixel } from './gear-pixel';
import { PixelAvatar } from './pixel-avatar';

export type RosterAction = 'shop' | 'delete';

// โมดอลลงทะเบียนผู้เล่น + รายชื่อผู้เล่นทั้งหมด
// - ลงทะเบียนด้วยชื่ออย่างเดียว (กรอกชื่อแล้วใช้ได้เลย)
// - แต่ละคนมีเหรียญรายบุคคล + สกินที่ตั้งค่าไว้ของตัวเอง
export function RegisterModal({
  open,
  players,
  skin,
  onRegister,
  onPlayerAction,
  onClose,
}: {
  open: boolean;
  players: PlayerProfile[];
  skin: HudSkin; // สกิน HUD ปัจจุบัน — ธีมกรอบโมดอลตามสกินทั้งหน้า
  onRegister: (name: string) => string; // คืนข้อความ error ('' = สำเร็จ)
  onPlayerAction: (name: string, action: RosterAction) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');

  if (!open) return null;

  function submit() {
    setError('');
    setOkMsg('');
    const err = onRegister(name);
    if (err) return setError(err);
    setOkMsg(`ลงทะเบียน "${name.trim()}" เรียบร้อย — ครั้งต่อไปเลือกชื่อนี้ในช่องผู้เล่นได้เลย`);
    setName('');
  }

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="ลงทะเบียนผู้เล่น"
      onClick={onClose}
    >
      <div
        className={`${skin.modalCard} w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* หัวโมดอล */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50 via-white to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
              <i className="fa-solid fa-user-plus"></i>
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100 leading-tight">
                ลงทะเบียนผู้เล่น
              </h2>
              <p className="text-xs text-gray-400">
                กรอกชื่อแล้วใช้ได้เลย • เหรียญและสกินเป็นของรายบุคคล
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="ปิดหน้าลงทะเบียนผู้เล่น"
            className="w-9 h-9 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition flex items-center justify-center shrink-0"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* เนื้อหา */}
        <div className="overflow-y-auto p-5 space-y-6">
          {/* ฟอร์มลงทะเบียนใหม่ */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-id-card text-emerald-500"></i>ลงทะเบียนผู้เล่นใหม่
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อผู้เล่น"
                aria-label="ชื่อผู้เล่นที่จะลงทะเบียน"
                maxLength={24}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-400 dark:bg-gray-800/70 dark:border-gray-700 dark:text-gray-100"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 active:scale-[0.98] text-sm"
              >
                <i className="fa-solid fa-user-plus"></i>ลงทะเบียน
              </button>
            </form>
            {error && (
              <p className="mt-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </p>
            )}
            {okMsg && (
              <p className="mt-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <i className="fa-solid fa-circle-check"></i>
                {okMsg}
              </p>
            )}
          </section>

          {/* รายชื่อผู้เล่น */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-users text-blue-500"></i>ผู้เล่นที่ลงทะเบียนแล้ว
              <span className="text-xs font-medium text-gray-400">({players.length} คน)</span>
            </h3>
            {players.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm dark:border-gray-700">
                <i className="fa-regular fa-id-card text-2xl mb-2 block"></i>
                ยังไม่มีผู้เล่น — ลงทะเบียนด้านบนเพื่อเริ่มเก็บเหรียญรายบุคคล
              </div>
            ) : (
              <ul className="space-y-2.5">
                {players.map((p) => {
                  const skin = getSkin(p.skinId);
                  const racket = getGear(p.racketId);
                  const shoe = getGear(p.shoeId);
                  return (
                    <li
                      key={p.name}
                      className="flex items-center gap-3 p-3 rounded-xl ring-1 ring-gray-100 bg-gray-50/60 dark:ring-gray-800 dark:bg-gray-800/40"
                    >
                      <span className="relative shrink-0 w-12 h-12 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        {skin && <PixelAvatar skin={skin} size={32} />}
                        {racket && (
                          <span className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-md bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-600 flex items-center justify-center shadow-sm">
                            <GearPixel gear={racket} size={12} />
                          </span>
                        )}
                        {shoe && (
                          <span className="absolute -bottom-1 -left-1 w-[18px] h-[18px] rounded-md bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-600 flex items-center justify-center shadow-sm">
                            <GearPixel gear={shoe} size={12} />
                          </span>
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                          <i className="fa-solid fa-coins text-[10px]"></i>
                          {p.coins} เหรียญ
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onPlayerAction(p.name, 'shop')}
                          title={`ร้านค้าสกินของ ${p.name}`}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 dark:hover:bg-amber-900/70 px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <i className="fa-solid fa-bag-shopping"></i>
                          <span className="hidden sm:inline">ร้านค้า</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onPlayerAction(p.name, 'delete')}
                          title={`ลบผู้เล่น ${p.name}`}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60 w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* ท้ายโมดอล */}
        <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60 flex items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400 hidden sm:block">
            <i className="fa-solid fa-circle-info mr-1"></i>
            ทุกคนมีเหรียญและสกินของตัวเอง — กดร้านค้าเพื่อปลดล็อคสกินใหม่ (100 เหรียญ/สกิน)
          </p>
          <button
            onClick={onClose}
            className="ml-auto bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-xl font-semibold shadow transition text-sm"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
