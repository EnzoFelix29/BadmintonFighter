// ไอคอนลูกแบดมินตัน (shuttlecock) SVG เส้นทึบ — ใช้ currentColor สีตามข้อความที่ครอบอยู่
// ใช้แทนไอคอนไม้ปิงปองของ Font Awesome ในจุดที่หมายถึงแบดมินตัน (ป้ายเสิร์ฟก่อน, กฎกติกา, ร้านค้า, รีลสกิน)
export function ShuttlecockIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={`inline-block shrink-0 ${className}`}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.6 2 H19.4 L13.4 14.2 A4.6 4.6 0 1 1 10.6 14.2 Z
           M9.4 2 L10.3 2 L11.5 13.8 L10.9 13.9 Z
           M13.7 2 L14.6 2 L13.1 13.9 L12.5 13.8 Z"
      />
    </svg>
  );
}
