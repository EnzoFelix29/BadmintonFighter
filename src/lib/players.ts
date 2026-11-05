// ============================================================
// ระบบสมาชิกผู้เล่น — ลงทะเบียนด้วยชื่ออย่างเดียว ครั้งต่อไปเลือกชื่อจากช่องผู้เล่นได้เลย
// แต่ละคนมีเหรียญรายบุคคล (ชนะ +7 / แพ้ +3, ชนะขาด +10) + สกินที่ตั้งค่าไว้
// เก็บใน localStorage key: badminton_players
// ============================================================
import { SKINS } from './characters';
import type { GearSkin } from './gear';

export interface PlayerProfile {
  name: string; // ชื่อที่ลงทะเบียน (คีย์ของผู้เล่น)
  coins: number; // เหรียญรายบุคคลสำหรับซื้อสกิน
  skinId: string; // สกินตัวละครที่ตั้งค่าไว้
  racketId: string; // สกินไม้แบดที่ตั้งค่าไว้
  shoeId: string; // สกินรองเท้าที่ตั้งค่าไว้
  owned: string[]; // สกินร้านค้า (ราคา 100 เหรียญ) ที่ปลดล็อคแล้ว
}

const KEY = 'badminton_players';

export const WIN_COINS = 7; // เหรียญที่ได้เมื่อชนะปกติ (รายบุคคล)
export const LOSE_COINS = 3; // เหรียญที่ได้เมื่อแพ้ (รายบุคคล)
export const CRUSH_WIN_COINS = 10; // เหรียญที่ได้เมื่อ "ชนะขาด" (ใช้แทนชนะปกติ)
export const CRUSH_LOSER_BELOW = 5; // ชนะขาด: ฝ่ายแพ้ได้แต้มต่ำกว่า 5
export const CRUSH_GAP_MIN = 15; // ชนะขาด: คะแนนห่างกันตั้งแต่ 15 แต้มขึ้นไป

// เช็ค "ชนะขาด" — ฝ่ายแพ้ได้แต้มต่ำกว่า 5 หรือคะแนนห่างกัน 15 แต้มขึ้นไป
export function isCrushWin(winnerScore: number, loserScore: number): boolean {
  return loserScore < CRUSH_LOSER_BELOW || winnerScore - loserScore >= CRUSH_GAP_MIN;
}

// คำนวณเหรียญของแมตช์: ชนะปกติ +7 / ชนะขาด +10 / แพ้ +3
export function calcMatchCoins(
  winnerScore: number,
  loserScore: number
): { winCoins: number; loseCoins: number; crush: boolean } {
  const crush = isCrushWin(winnerScore, loserScore);
  return { winCoins: crush ? CRUSH_WIN_COINS : WIN_COINS, loseCoins: LOSE_COINS, crush };
}

// โหลดโปรไฟล์ผู้เล่นทั้งหมดจาก localStorage
export function loadPlayers(): PlayerProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((p): p is PlayerProfile => !!p && typeof (p as PlayerProfile).name === 'string')
      .map((p) => ({
        name: p.name,
        coins: typeof p.coins === 'number' ? p.coins : 0,
        skinId: p.skinId || SKINS[0].id,
        racketId: p.racketId || 'r1',
        shoeId: p.shoeId || 's1',
        owned: Array.isArray(p.owned) ? p.owned : [],
      }));
  } catch {
    return [];
  }
}

// บันทึกโปรไฟล์ผู้เล่นทั้งหมดลง localStorage
export function savePlayers(players: PlayerProfile[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(players));
  } catch {
    // บันทึกไม่ได้ก็ข้าม
  }
}

export function findPlayer(players: PlayerProfile[], name: string): PlayerProfile | undefined {
  return players.find((p) => p.name === name);
}

// ลงทะเบียนผู้เล่นใหม่ (ชื่ออย่างเดียว) — คืน error ภาษาไทยถ้าไม่ผ่าน
export function registerPlayer(
  players: PlayerProfile[],
  rawName: string
): { ok: boolean; error?: string; players: PlayerProfile[] } {
  const name = rawName.trim();
  if (!name) return { ok: false, error: 'กรุณากรอกชื่อผู้เล่น', players };
  if (name.length > 24) return { ok: false, error: 'ชื่อต้องไม่เกิน 24 ตัวอักษร', players };
  if (players.some((p) => p.name.toLowerCase() === name.toLowerCase()))
    return { ok: false, error: `มีผู้เล่นชื่อ "${name}" ลงทะเบียนอยู่แล้ว`, players };

  // สกินเริ่มต้น: ตัวละครที่ยังไม่มีใครใช้ + ไม้/รองเท้าฟรีวนตามลำดับการลงทะเบียน
  const skinId = SKINS.find((s) => !players.some((p) => p.skinId === s.id))?.id ?? SKINS[0].id;
  const idx = players.length;
  const profile: PlayerProfile = {
    name,
    coins: 0,
    skinId,
    racketId: `r${(idx % 20) + 1}`,
    shoeId: `s${(idx % 20) + 1}`,
    owned: [],
  };
  return { ok: true, players: [...players, profile] };
}

// ลบผู้เล่นออกจากระบบ
export function deletePlayer(players: PlayerProfile[], name: string): PlayerProfile[] {
  return players.filter((p) => p.name !== name);
}

// แก้ไขโปรไฟล์บางส่วน (สกิน / เหรียญ)
export function updateProfile(
  players: PlayerProfile[],
  name: string,
  patch: Partial<Omit<PlayerProfile, 'name'>>
): PlayerProfile[] {
  return players.map((p) => (p.name === name ? { ...p, ...patch } : p));
}

// จ่ายเหรียญรายบุคคลหลังจบแมตช์ (ค่าเหรียญมาจาก calcMatchCoins)
export function awardCoins(
  players: PlayerProfile[],
  winnerNames: string[],
  loserNames: string[],
  winCoins = WIN_COINS,
  loseCoins = LOSE_COINS
): { players: PlayerProfile[]; winCoins: number; loseCoins: number } {
  return {
    players: players.map((p) => ({
      ...p,
      coins:
        p.coins +
        (winnerNames.includes(p.name) ? winCoins : loserNames.includes(p.name) ? loseCoins : 0),
    })),
    winCoins,
    loseCoins,
  };
}

// ซื้อ/ปลดล็อคสกินร้านค้าด้วยเหรียญของผู้เล่นคนนั้น (100 เหรียญ/สกิน)
export function purchaseGear(
  players: PlayerProfile[],
  name: string,
  gear: GearSkin
): { ok: boolean; error?: string; players: PlayerProfile[] } {
  const p = findPlayer(players, name);
  if (!p) return { ok: false, error: 'ไม่พบผู้เล่น', players };
  if (gear.price <= 0 || p.owned.includes(gear.id))
    return { ok: false, error: 'สกินนี้ปลดล็อคอยู่แล้ว', players };
  if (p.coins < gear.price)
    return { ok: false, error: `เหรียญไม่พอ ต้องการอีก ${gear.price - p.coins} เหรียญ`, players };
  return {
    ok: true,
    players: updateProfile(players, name, {
      coins: p.coins - gear.price,
      owned: [...p.owned, gear.id],
    }),
  };
}
