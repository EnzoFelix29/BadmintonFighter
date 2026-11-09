'use client';

import { useState } from 'react';
import { SKINS, type Gender, type Skin } from '@/lib/characters';
import { useLang } from '@/lib/i18n';
import type { HudSkin } from '@/lib/hud-skins';
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
  hudSkin,
  onPick,
  onClose,
}: {
  open: boolean;
  slot: PickerSlot | null;
  playerName: string; // ชื่อผู้เล่นเจ้าของสกิน (สกินจะถูกบันทึกเป็นค่าเริ่มต้นของคนนี้)
  currentId: string;
  excludeIds: string[];
  hudSkin: HudSkin;
  onPick: (skin: Skin) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('all');
  const { t } = useLang();

  if (!open || !slot) return null;

  const list = SKINS.filter((s) => tab === 'all' || s.gender === tab);
  const isA = slot.startsWith('A');
  const playerNo = slot[1];

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('เลือกสกินตัวละคร')}
      onClick={onClose}
    >
      <div
        className={`${hudSkin.modalCard} w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden ring-1`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* หัวโมดอล */}
        <div className={`flex justify-between items-center px-5 py-4 border-b ${hudSkin.page}`}>
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${isA ? hudSkin.nameA : hudSkin.nameB}`}
            >
              {slot}
            </span>
            <div className="min-w-0">
              <h2 className={`text-lg font-bold leading-tight truncate ${hudSkin.heading}`}>
                {t('เลือกสกินตัวละคร — {name}', {
                  name: playerName || t('ทีม {team} • ผู้เล่น {no}', { team: slot[0], no: playerNo }),
                })}
              </h2>
              <p className="text-xs text-gray-400">
                {t('สกิน 8-bit ทั้งหมด {n} แบบ • ที่เลือกจะบันทึกเป็นของผู้เล่นคนนี้', { n: SKINS.length })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('ปิดหน้าต่างเลือกตัวละคร')}
            className={`w-9 h-9 rounded-xl transition flex items-center justify-center shrink-0 ${hudSkin.chip}`}
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* แท็บเพศ */}
        <div className="flex gap-2 px-5 pt-4 pb-1">
          {(
            [
              { key: 'all', label: t('ทั้งหมด'), icon: 'fa-user-group', count: SKINS.length },
              { key: 'male', label: t('ชาย'), icon: 'fa-mars', count: SKINS.filter((s) => s.gender === 'male').length },
              { key: 'female', label: t('หญิง'), icon: 'fa-venus', count: SKINS.filter((s) => s.gender === 'female').length },
            ] as { key: Tab; label: string; icon: string; count: number }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition ring-1 ${
                tab === t.key
                  ? `${hudSkin.btn} ${hudSkin.border}`
                  : hudSkin.chip
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
                  title={
                    taken
                      ? t('สกินนี้ถูกใช้โดยผู้เล่นคนอื่นในแมตช์นี้แล้ว')
                      : t('เลือกสกินตัวละคร')
                  }
                  aria-pressed={active}
                  className={`relative flex flex-col items-center gap-1 rounded-2xl p-2.5 pt-3 transition ring-1 ${
                    taken
                      ? 'opacity-35 cursor-not-allowed'
                      : active
                        ? `${hudSkin.card} ring-2`
                        : `${hudSkin.card} hover:-translate-y-0.5`
                  }`}
                >
                  {active && (
                    <span className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center ${hudSkin.btn}`}>
                      <i className="fa-solid fa-check"></i>
                    </span>
                  )}
                  {taken && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gray-400 text-white text-[10px] flex items-center justify-center">
                      <i className="fa-solid fa-xmark"></i>
                    </span>
                  )}
                  <span className={`rounded-xl px-3.5 py-2 ${hudSkin.panelIcon}`}>
                    <PixelAvatar skin={skin} size={50} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ท้ายโมดอล */}
        <div className={`px-5 py-3.5 border-t flex items-center justify-between gap-3 ${hudSkin.page}`}>
          <p className="text-[11px] text-gray-400 hidden sm:block">
            <i className="fa-solid fa-circle-info mr-1"></i>
            {t('สกินเดียวกันใช้ได้คนละ 1 คนต่อแมตช์ — เลือกเลย ไม่ต้องใส่รหัส')}
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
