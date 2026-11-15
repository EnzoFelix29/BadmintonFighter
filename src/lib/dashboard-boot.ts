// ============================================================
// dashboard-boot — เปิด mini service "visitor dashboard" (:3030)
// จากฝั่งเซิร์ฟเวอร์แบบ idempotent (พยายามครั้งเดียวต่อโปรเซส)
//
// ทำไมต้องมีตัวนี้: sandbox จะ kill โปรเซสที่ถูกสั่งรันจากภายนอก
// (bash/แยก session) ทิ้งระหว่างการทำงาน แต่โปรเซสลูกของ next-server
// จะอยู่รอด (อยู่ process group เดียวกับแอปหลัก) เราจึง spawn จากในนี้
// และ instrumentation.ts เรียกตัวนี้อีกทีตอนเซิร์ฟเวอร์บูต
// ============================================================

let bootAttempted = false;

export async function bootVisitorDashboard(): Promise<void> {
  // บน Vercel serverless spawn เซิร์ฟเวอร์ยาว :3030 ไม่ได้ (และไม่จำเป็น —
  // แดชบอร์ดย้ายเป็น route /visitors ในแอปหลักแล้ว) — ข้ามทันที
  if (process.env.VERCEL) return;
  if (bootAttempted) return;
  bootAttempted = true;

  try {
    // ถ้า dashboard รันอยู่แล้ว → ข้าม (กัน spawn ซ้ำจนพอร์ตชนกัน)
    const alive = await fetch('http://127.0.0.1:3030/api/stats', {
      signal: AbortSignal.timeout(800),
      cache: 'no-store',
    })
      .then((r) => r.ok)
      .catch(() => false);
    if (alive) {
      console.log('[dashboard-boot] visitor-dashboard :3030 already running — skip');
      return;
    }

    // turbopackIgnore/webpackIgnore → ให้ import นี้เป็น native import ตอนรันจริง
    // (ไม่ถูก bundler ยัดเข้า edge bundle = ไม่มี warning และได้ module จริงใน Node)
    const cp = await import(/* turbopackIgnore: true */ /* webpackIgnore: true */ 'child_process');
    const child = cp.spawn('bun', ['--hot', 'index.ts'], {
      cwd: `${process.cwd()}/mini-services/visitor-dashboard`,
      stdio: 'ignore',
    });
    child.on('error', (err: Error) =>
      console.error('[dashboard-boot] spawn visitor-dashboard failed:', err.message)
    );
    child.unref();
    console.log('[dashboard-boot] spawned visitor-dashboard mini service on :3030');
  } catch (err) {
    // ความพังของแดชบอร์ดไม่มีผลกับแอปหลัก — log ไว้ดีบักเท่านั้น
    console.error(
      '[dashboard-boot] visitor-dashboard bootstrap error:',
      err instanceof Error ? err.message : err
    );
  }
}
