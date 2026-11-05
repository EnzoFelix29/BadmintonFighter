'use client';

import { useState } from 'react';
import { SKINS, type Gender, type Skin } from '@/lib/characters';
import { PixelAvatar } from './pixel-avatar';

type Tab = 'all' | Gender;

export type PickerSlot = 'A1' | 'A2' | 'B1' | 'B2';

// โมดอลเลือกสกินตัวละคร 8-bit (30 สกิน: ชาย 15 / หญิง 15)
// parent ใช้ key={slot} เพื่อ remount ทุกครั้งที่เปิด → tab กลับเป็น "ทั้งหมด" เสมอ
export function CharacterPicker({
  open,
  slot,
  playerName,
  currentId,
  excludeIds,
  onPick,
  onClose,
}: {
  open: boolean;
  slot: PickerSlot | null;
  playerName: string; // ชื่อผู้เล่นเจ้าของสกิน (สกินจะถูกบันทึกเป็นค่าเริ่มต้นของคนนี้)
  currentId: string;
  excludeIds: string[];
  onPick: (skin: Skin) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('all');

  if (!open || !slot) return null;

  const list = SKINS.filter((s) => tab === 'all' || s.gender === tab);
  const isA = slot.startsWith('A');
  const playerNo = slot[1];

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="เลือกสกินตัวละคร"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden ring-1 ring-gray-200/70 dark:ring-gray-700/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* หัวโมดอล */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50 via-white to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-extrabold shadow-lg shrink-0 ${
                isA
                  ? 'bg-gradient-to-br from-blue-600 to-sky-500 shadow-blue-600/25'
                  : 'bg-gradient-to-br from-rose-600 to-pink-500 shadow-rose-600/25'
              }`}
            >
              {slot}
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100 leading-tight truncate">
                เลือกสกินตัวละคร — {playerName || `ทีม ${slot[0]} • ผู้เล่น ${playerNo}`}
              </h2>
              <p className="text-xs text-gray-400">
                สกิน 8-bit ทั้งหมด {SKINS.length} แบบ • ที่เลือกจะบันทึกเป็นของผู้เล่นคนนี้
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่างเลือกตัวละคร"
            className="w-9 h-9 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition flex items-center justify-center shrink-0"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* แท็บเพศ */}
        <div className="flex gap-2 px-5 pt-4 pb-1">
          {(
            [
              { key: 'all', label: 'ทั้งหมด', icon: 'fa-user-group', count: SKINS.length },
              { key: 'male', label: 'ชาย', icon: 'fa-mars', count: SKINS.filter((s) => s.gender === 'male').length },
              { key: 'female', label: 'หญิง', icon: 'fa-venus', count: SKINS.filter((s) => s.gender === 'female').length },
            ] as { key: Tab; label: string; icon: string; count: number }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition ring-1 ${
                tab === t.key
                  ? 'bg-blue-600 text-white ring-blue-600 shadow-md shadow-blue-600/25'
                  : 'bg-gray-50 text-gray-500 ring-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700'
              }`}
            >
              <i className={`fa-solid ${t.icon} mr-1.5`}></i>
              {t.label} {t.count}
            </button>
          ))}
        </div>

        {/* กริดตัวละคร */}
        <div className="overflow-y-auto p-5 pt-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {list.map((skin) => {
              const active = skin.id === currentId;
              const taken = excludeIds.includes(skin.id);
              return (
                <button
                  key={skin.id}
                  onClick={() => !taken && onPick(skin)}
                  disabled={taken}
                  title={taken ? 'สกินนี้ถูกใช้โดยผู้เล่นคนอื่นในแมตช์นี้แล้ว' : 'เลือกสกินตัวละคร'}
                  aria-pressed={active}
                  className={`relative flex flex-col items-center gap-1 rounded-2xl p-2.5 pt-3 transition ring-1 ${
                    taken
                      ? 'opacity-35 cursor-not-allowed ring-gray-200 bg-gray-50 dark:ring-gray-800 dark:bg-gray-800/40'
                      : active
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/60 dark:ring-blue-400 shadow-md shadow-blue-500/10'
                        : 'ring-gray-200 bg-white hover:ring-blue-300 hover:bg-blue-50/50 hover:-translate-y-0.5 dark:bg-gray-800 dark:ring-gray-700 dark:hover:ring-blue-700 dark:hover:bg-blue-950/40'
                  }`}
                >
                  {active && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center shadow">
                      <i className="fa-solid fa-check"></i>
                    </span>
                  )}
                  {taken && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gray-400 text-white text-[10px] flex items-center justify-center">
                      <i className="fa-solid fa-xmark"></i>
                    </span>
                  )}
                  <span className="rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-800 px-3.5 py-2">
                    <PixelAvatar skin={skin} size={50} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ท้ายโมดอล */}
        <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60 flex items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400 hidden sm:block">
            <i className="fa-solid fa-circle-info mr-1"></i>สกินเดียวกันใช้ได้คนละ 1 คนต่อแมตช์ — เลือกเลย ไม่ต้องใส่รหัส
          </p>
          <button
            onClick={onClose}
            className="ml-auto bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-xl font-semibold shadow transition text-sm"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}
