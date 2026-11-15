'use client';

import { useEffect, useRef } from 'react';

// ============================================================
// VisitorTracker — ตัวนับผู้เข้าใช้ฝั่งหน้าเว็บ (ไม่แสดง UI อะไรเลย)
// - สร้าง/อ่านรหัสผู้ใช้จาก localStorage (badminton_visitor_id)
// - ส่ง heartbeat ไป /api/visitors ทันทีที่เปิดหน้า + ทุก 20 วินาที
// - กลับมาดูแท็บอีกครั้ง (visibilitychange) จะส่งเพิ่มทันทีด้วย
// - รับจำนวนคนออนไลน์จาก API ส่งกลับ แล้วเรียก onOnline(n)
//   เพื่อโชว์เป็นป้ายตัวเลขสด ๆ บนปุ่ม navbar
// ============================================================

const VISITOR_KEY = 'badminton_visitor_id';

function makeVisitorId(): string {
  return 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export function VisitorTracker({ onOnline }: { onOnline?: (online: number) => void }) {
  // เก็บ callback ไว้ใน ref กัน effect รันซ้ำเมื่อ parent re-render (assign ใน effect เท่านั้น)
  const onOnlineRef = useRef(onOnline);
  useEffect(() => {
    onOnlineRef.current = onOnline;
  }, [onOnline]);

  useEffect(() => {
    let id = '';
    try {
      id = localStorage.getItem(VISITOR_KEY) || '';
    } catch {
      // localStorage ใช้ไม่ได้ (โหมดส่วนตัว) — ใช้รหัสชั่วคราวของเซสชันนี้
    }
    if (!id) {
      id = makeVisitorId();
      try {
        localStorage.setItem(VISITOR_KEY, id);
      } catch {
        // บันทึกไม่ได้ก็ใช้ชั่วคราว
      }
    }

    const beat = () => {
      let lang = 'th';
      try {
        lang = localStorage.getItem('badminton_lang') === 'en' ? 'en' : 'th';
      } catch {
        // ค่าเริ่มต้นไทย
      }
      fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: id,
          page: window.location.pathname,
          lang,
          screen: `${window.innerWidth}x${window.innerHeight}`,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((j: { ok?: boolean; online?: number } | null) => {
          if (j && j.ok && typeof j.online === 'number') onOnlineRef.current?.(j.online);
        })
        .catch(() => {
          // ยิง heartbeat ไม่สำเร็จ (เน็ต/เซิร์ฟเวอร์) — เปลี่ยนเงียบ ๆ รอบรอบที่จะยิงใหม่
        });
    };

    beat();
    const iv = setInterval(beat, 20_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') beat();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return null;
}
