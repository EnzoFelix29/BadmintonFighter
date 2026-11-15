// ============================================================
// visitor-unlock — ระบบปลดล็อก Visitor Dashboard ฝั่งเซิร์ฟเวอร์
// รหัสลับถูกเก็บไว้ที่นี่เท่านั้น (server code) — ไม่ถูก bundle ลง JS
// ที่ส่งออกมาให้เบราว์เซอร์ ใครเปิด DevTools จะหารหัสไม่เจอ
//
// กลไก:
//   ใส่รหัสถูก → เซิร์ฟเวอร์ออก cookie "vd_unlock" (HttpOnly) เก็บ token
//   ที่ลงชื่อด้วย HMAC-SHA256 อยู่ 30 วัน → ใช้เปิด GET /api/visitors ได้
//   ปลอม cookie ไม่ได้เพราะต้องรู้ SECRET ที่อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น
//
// เปลี่ยนรหัสได้โดยตั้ง env: DEV_PASSCODE (ไม่ต้องแก้โค้ด)
// ============================================================

import crypto from 'crypto';

// รหัสลับ 10 หลัก — อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น
export const DEV_PASSCODE = process.env.DEV_PASSCODE || '0990909963';

export const UNLOCK_COOKIE = 'vd_unlock';
export const UNLOCK_MAX_AGE = 60 * 60 * 24 * 30; // cookie อยู่ 30 วัน

// กุญแจลงชื่อ token — ใช้รหัสเป็นส่วนผสม + env เอาไว้ทับได้
const SECRET = process.env.DEV_UNLOCK_SECRET || `${DEV_PASSCODE}|visitor-dashboard-hmac`;

function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
}

/** token รูปแบบ "vd:<expiry_ms>.<hmac>" */
export function makeUnlockToken(): string {
  const exp = Date.now() + UNLOCK_MAX_AGE * 1000;
  const payload = `vd:${exp}`;
  return `${payload}.${sign(payload)}`;
}

/** เทียบ token กับลายเซ็นที่คำนวณจาก SECRET (แบบ timing-safe) + เช็ควันหมดอายุ */
function validToken(tok: string | undefined): boolean {
  if (!tok) return false;
  const idx = tok.lastIndexOf('.');
  if (idx <= 0) return false;
  const payload = tok.slice(0, idx);
  const mac = tok.slice(idx + 1);
  const a = Buffer.from(mac);
  const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  const exp = Number(payload.split(':')[1]);
  return Number.isFinite(exp) && Date.now() < exp;
}

/** สร้าง Set-Cookie header ที่ปลดล็อก (HttpOnly — JS อ่านค่า cookie นี้ไม่ได้) */
export function unlockCookieHeader(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${UNLOCK_COOKIE}=${encodeURIComponent(makeUnlockToken())}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${UNLOCK_MAX_AGE}${secure}`;
}

/** Set-Cookie สำหรับล็อกกลับ (ลบ cookie ทิ้ง) */
export function clearUnlockCookieHeader(): string {
  return `${UNLOCK_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

/** อ่าน + ตรวจ cookie จาก request → ปลดล็อกอยู่ไหม */
export function isUnlocked(request: Request): boolean {
  const raw = request.headers.get('cookie') || '';
  const hit = raw
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(UNLOCK_COOKIE + '='));
  if (!hit) return false;
  try {
    const tok = decodeURIComponent(hit.slice(UNLOCK_COOKIE.length + 1));
    return validToken(tok);
  } catch {
    return false;
  }
}

/** เทียบรหัสที่ผู้ใช้ใส่กับรหัสจริง (timing-safe กันจับเวลาเดารหัสทีละตัว) */
export function checkPasscode(code: string): boolean {
  const a = Buffer.from(code);
  const b = Buffer.from(DEV_PASSCODE);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
