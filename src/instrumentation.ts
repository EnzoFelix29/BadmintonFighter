// ============================================================
// Next.js instrumentation hook — ทำงานตอนเซิร์ฟเวอร์เริ่มทำงาน (บูตครั้งเดียว)
// หน้าที่: เปิด mini service "visitor dashboard" (:3030) ให้พร้อมใช้อัตโนมัติ
// เพราะ sandbox รีสตาร์ท dev server ทุกครั้ง แต่ไม่ได้เปิดบริการเสริมให้ด้วย
// ตรรกะการ spawn อยู่ที่ src/lib/dashboard-boot.ts (ใช้ร่วมกับ API route)
// ============================================================

export async function register() {
  if (process.env.NEXT_PHASE === 'phase-production-build') return; // ข้ามตอน build
  if (process.env.NEXT_RUNTIME !== 'nodejs') return; // ทำงานเฉพาะ Node runtime

  try {
    const { bootVisitorDashboard } = await import('@/lib/dashboard-boot');
    await bootVisitorDashboard();
  } catch (err) {
    // ความพังของแดชบอร์ดไม่มีผลกับแอปหลัก — log ไว้ดีบักเท่านั้น
    console.error(
      '[instrumentation] visitor-dashboard bootstrap error:',
      err instanceof Error ? err.message : err
    );
  }
}
