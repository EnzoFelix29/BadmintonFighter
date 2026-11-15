// ============================================================
// API ปลดล็อก Visitor Dashboard — /api/visitors/unlock
// รหัสลับถูกตรวจ "ฝั่งเซิร์ฟเวอร์" — รหัสไม่เคยถูกส่งออกไปใน JS bundle
// - POST   { code } → ถูกต้อง = ออก HttpOnly cookie ลงชื่อ HMAC อยู่ 30 วัน
// - DELETE → ล็อกกลับ (ลบ cookie ทิ้ง)
// - GET    → ถามสถานะ { unlocked: true/false } (ใช้กันกระพริบหน้าล็อก)
// ============================================================

import {
  checkPasscode,
  unlockCookieHeader,
  clearUnlockCookieHeader,
  isUnlocked,
} from '@/lib/visitor-unlock';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---------- POST : ส่งรหัสมาตรวจ ----------
export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    // body ไม่ใช่ JSON = รหัสว่าง = ผิด
  }
  const code = typeof body.code === 'string' ? body.code.trim() : '';

  if (!checkPasscode(code)) {
    // ตั้งใจหน่วงนิดหน่อย กันยิงรหัสถล่มเร็ว ๆ
    await new Promise((r) => setTimeout(r, 400));
    return Response.json({ ok: false, error: 'wrong code' }, { status: 401 });
  }

  return Response.json(
    { ok: true, unlocked: true },
    { headers: { 'Set-Cookie': unlockCookieHeader() } }
  );
}

// ---------- DELETE : ล็อกกลับ ----------
export async function DELETE() {
  return Response.json(
    { ok: true, unlocked: false },
    { headers: { 'Set-Cookie': clearUnlockCookieHeader() } }
  );
}

// ---------- GET : ตรวจสถานะปลดล็อก ----------
export async function GET(request: Request) {
  return Response.json({ ok: true, unlocked: isUnlocked(request) });
}
