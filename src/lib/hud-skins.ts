// ============================================================
// สกิน HUD และโทนสีทั่วทั้งแอป
// เลือกไว้แล้วจะจำค่าใน localStorage key: badminton_hud_skin
// ============================================================

export interface HudSkin {
  id: string;
  name: string;
  tag: string;
  chip: string;
  card: string;
  nameA: string;
  nameB: string;
  score: string;
  scoreA?: string;
  scoreB?: string;
  colon: string;
  sub: string;
  serve: string;
  flipBtn: string;
  coin: string;
  page: string;
  nav: string;
  panel: string;
  panelIcon: string;
  heading: string;
  btn: string;
  modalCard: string;
}

export const HUD_SKIN_KEY = 'badminton_hud_skin';

type SkinPalette = Pick<HudSkin, 'chip' | 'nameA' | 'serve' | 'flipBtn' | 'coin'> & {
  id: string;
  name: string;
  tag: string;
  border: string;
  navBorder: string;
  icon: string;
};

const PALETTES: SkinPalette[] = [
  {
    id: 'classic',
    name: 'คลาสสิก',
    tag: 'โทนสนามและใบบันทึกคะแนน',
    chip: 'bg-[#e8eee8] border border-[#cad8cb] text-[#355c3e] dark:bg-[#28342b] dark:border-[#425943] dark:text-[#c3d8c4]',
    nameA: 'text-[#355c3e] dark:text-[#a9c6ac]',
    serve: 'bg-[#426b49] text-white',
    flipBtn: 'bg-[#426b49] hover:bg-[#355c3e] text-white',
    coin: 'bg-[#e8eee8] text-[#355c3e] border-2 border-[#cad8cb] dark:bg-[#28342b] dark:text-[#c3d8c4] dark:border-[#425943]',
    border: 'border-[#d9e2d9] dark:border-[#3b4b3d]',
    navBorder: 'border-[#426b49]',
    icon: 'bg-[#e8eee8] text-[#3d6845] dark:bg-[#28342b] dark:text-[#9fbea4]',
  },
  {
    id: 'neon',
    name: 'นีออน',
    tag: 'ทีลเข้มและฟ้าน้ำหมึก',
    chip: 'bg-[#e3f1f1] border border-[#b9d8d8] text-[#145a5e] dark:bg-[#233b3c] dark:border-[#3b6668] dark:text-[#a5d4d4]',
    nameA: 'text-[#145a5e] dark:text-[#a5d4d4]',
    serve: 'bg-[#176c70] text-white',
    flipBtn: 'bg-[#176c70] hover:bg-[#12575a] text-white',
    coin: 'bg-[#e3f1f1] text-[#145a5e] border-2 border-[#b9d8d8] dark:bg-[#233b3c] dark:text-[#a5d4d4] dark:border-[#3b6668]',
    border: 'border-[#c9dddd] dark:border-[#365e60]',
    navBorder: 'border-[#176c70]',
    icon: 'bg-[#e3f1f1] text-[#145a5e] dark:bg-[#233b3c] dark:text-[#a5d4d4]',
  },
  {
    id: 'retro',
    name: 'เรโทร 8-บิต',
    tag: 'หมึกสีงาช้างกับทองหม่น',
    chip: 'bg-[#f3efd9] border border-[#ded2a2] text-[#554712] dark:bg-[#3a3521] dark:border-[#6d5f30] dark:text-[#e1d18a]',
    nameA: 'text-[#554712] dark:text-[#e1d18a]',
    serve: 'bg-[#70601d] text-white',
    flipBtn: 'bg-[#70601d] hover:bg-[#5a4c16] text-white',
    coin: 'bg-[#f3efd9] text-[#554712] border-2 border-[#ded2a2] dark:bg-[#3a3521] dark:text-[#e1d18a] dark:border-[#6d5f30]',
    border: 'border-[#ded6b5] dark:border-[#65582d]',
    navBorder: 'border-[#9a8533]',
    icon: 'bg-[#f3efd9] text-[#554712] dark:bg-[#3a3521] dark:text-[#e1d18a]',
  },
  {
    id: 'gold',
    name: 'ทองหรู',
    tag: 'ทองเก่าและหมึกเข้ม',
    chip: 'bg-[#f4ecd9] border border-[#dfc995] text-[#6b4c11] dark:bg-[#3c3322] dark:border-[#6f5a2c] dark:text-[#e5ce8c]',
    nameA: 'text-[#6b4c11] dark:text-[#e5ce8c]',
    serve: 'bg-[#805b16] text-white',
    flipBtn: 'bg-[#805b16] hover:bg-[#674711] text-white',
    coin: 'bg-[#f4ecd9] text-[#6b4c11] border-2 border-[#dfc995] dark:bg-[#3c3322] dark:text-[#e5ce8c] dark:border-[#6f5a2c]',
    border: 'border-[#e1d4b4] dark:border-[#64532b]',
    navBorder: 'border-[#a27b2b]',
    icon: 'bg-[#f4ecd9] text-[#6b4c11] dark:bg-[#3c3322] dark:text-[#e5ce8c]',
  },
  {
    id: 'mono',
    name: 'มินิมอล',
    tag: 'กราไฟต์และขาวนวล',
    chip: 'bg-[#e9edeb] border border-[#cfd5d1] text-[#404743] dark:bg-[#2b302d] dark:border-[#4b534e] dark:text-[#c9cfcb]',
    nameA: 'text-[#404743] dark:text-[#c9cfcb]',
    serve: 'bg-[#454c48] text-white dark:bg-[#d2d8d3] dark:text-[#252a27]',
    flipBtn: 'bg-[#454c48] hover:bg-[#303633] text-white dark:bg-[#d2d8d3] dark:hover:bg-white dark:text-[#252a27]',
    coin: 'bg-[#e9edeb] text-[#404743] border-2 border-[#cfd5d1] dark:bg-[#2b302d] dark:text-[#c9cfcb] dark:border-[#4b534e]',
    border: 'border-[#d8ddda] dark:border-[#3b413d]',
    navBorder: 'border-[#aeb6b0]',
    icon: 'bg-[#e9edeb] text-[#404743] dark:bg-[#2b302d] dark:text-[#c9cfcb]',
  },
  {
    id: 'forest',
    name: 'ป่าเขียว',
    tag: 'ใบไม้เข้มและเขียวหม่น',
    chip: 'bg-[#e3eee8] border border-[#c1d7c7] text-[#2f6849] dark:bg-[#24382d] dark:border-[#3d674d] dark:text-[#a7ceb3]',
    nameA: 'text-[#2f6849] dark:text-[#a7ceb3]',
    serve: 'bg-[#2f6849] text-white',
    flipBtn: 'bg-[#2f6849] hover:bg-[#28583d] text-white',
    coin: 'bg-[#e3eee8] text-[#2f6849] border-2 border-[#c1d7c7] dark:bg-[#24382d] dark:text-[#a7ceb3] dark:border-[#3d674d]',
    border: 'border-[#cbded0] dark:border-[#385a43]',
    navBorder: 'border-[#2f6849]',
    icon: 'bg-[#e3eee8] text-[#2f6849] dark:bg-[#24382d] dark:text-[#a7ceb3]',
  },
  {
    id: 'sakura',
    name: 'ซากุระ',
    tag: 'กุหลาบหม่นบนพื้นหมึก',
    chip: 'bg-[#f4e9ed] border border-[#e1c4cf] text-[#94475d] dark:bg-[#3a2b31] dark:border-[#704151] dark:text-[#dda8b8]',
    nameA: 'text-[#94475d] dark:text-[#dda8b8]',
    serve: 'bg-[#9a4f64] text-white',
    flipBtn: 'bg-[#9a4f64] hover:bg-[#824052] text-white',
    coin: 'bg-[#f4e9ed] text-[#94475d] border-2 border-[#e1c4cf] dark:bg-[#3a2b31] dark:text-[#dda8b8] dark:border-[#704151]',
    border: 'border-[#e4ccd5] dark:border-[#65404e]',
    navBorder: 'border-[#9a4f64]',
    icon: 'bg-[#f4e9ed] text-[#94475d] dark:bg-[#3a2b31] dark:text-[#dda8b8]',
  },
  {
    id: 'ocean',
    name: 'มหาสมุทร',
    tag: 'น้ำหมึกและฟ้าเหล็ก',
    chip: 'bg-[#e4eef1] border border-[#c2d9df] text-[#286173] dark:bg-[#25363b] dark:border-[#3d6671] dark:text-[#a7cbd4]',
    nameA: 'text-[#286173] dark:text-[#a7cbd4]',
    serve: 'bg-[#286173] text-white',
    flipBtn: 'bg-[#286173] hover:bg-[#1f4e5e] text-white',
    coin: 'bg-[#e4eef1] text-[#286173] border-2 border-[#c2d9df] dark:bg-[#25363b] dark:text-[#a7cbd4] dark:border-[#3d6671]',
    border: 'border-[#cbdde1] dark:border-[#3a5a64]',
    navBorder: 'border-[#286173]',
    icon: 'bg-[#e4eef1] text-[#286173] dark:bg-[#25363b] dark:text-[#a7cbd4]',
  },
  {
    id: 'lava',
    name: 'ลาวา',
    tag: 'ดินแดงและถ่าน',
    chip: 'bg-[#f4eae5] border border-[#e0c8bb] text-[#934e37] dark:bg-[#3d2d28] dark:border-[#795040] dark:text-[#d8a792]',
    nameA: 'text-[#934e37] dark:text-[#d8a792]',
    serve: 'bg-[#934e37] text-white',
    flipBtn: 'bg-[#934e37] hover:bg-[#783b28] text-white',
    coin: 'bg-[#f4eae5] text-[#934e37] border-2 border-[#e0c8bb] dark:bg-[#3d2d28] dark:text-[#d8a792] dark:border-[#795040]',
    border: 'border-[#e2cec3] dark:border-[#684537]',
    navBorder: 'border-[#934e37]',
    icon: 'bg-[#f4eae5] text-[#934e37] dark:bg-[#3d2d28] dark:text-[#d8a792]',
  },
  {
    id: 'galaxy',
    name: 'กาแล็กซี',
    tag: 'พลบค่ำและม่วงหม่น',
    chip: 'bg-[#ece9f4] border border-[#d0c8e0] text-[#605184] dark:bg-[#302d3a] dark:border-[#5e5278] dark:text-[#c3b6e2]',
    nameA: 'text-[#605184] dark:text-[#c3b6e2]',
    serve: 'bg-[#66568d] text-white',
    flipBtn: 'bg-[#66568d] hover:bg-[#514374] text-white',
    coin: 'bg-[#ece9f4] text-[#605184] border-2 border-[#d0c8e0] dark:bg-[#302d3a] dark:text-[#c3b6e2] dark:border-[#5e5278]',
    border: 'border-[#d5cee3] dark:border-[#554a6b]',
    navBorder: 'border-[#66568d]',
    icon: 'bg-[#ece9f4] text-[#605184] dark:bg-[#302d3a] dark:text-[#c3b6e2]',
  },
  {
    id: 'candy',
    name: 'ลูกกวาด',
    tag: 'เบอร์รี่กับครีมหม่น',
    chip: 'bg-[#f3e9ef] border border-[#ddc2d1] text-[#944768] dark:bg-[#392b33] dark:border-[#73445b] dark:text-[#daaac3]',
    nameA: 'text-[#944768] dark:text-[#daaac3]',
    serve: 'bg-[#9b4f72] text-white',
    flipBtn: 'bg-[#9b4f72] hover:bg-[#823e5e] text-white',
    coin: 'bg-[#f3e9ef] text-[#944768] border-2 border-[#ddc2d1] dark:bg-[#392b33] dark:text-[#daaac3] dark:border-[#73445b]',
    border: 'border-[#e2ccd8] dark:border-[#664052]',
    navBorder: 'border-[#9b4f72]',
    icon: 'bg-[#f3e9ef] text-[#944768] dark:bg-[#392b33] dark:text-[#daaac3]',
  },
];

function createSkin(palette: SkinPalette): HudSkin {
  const neutralTeam = 'text-[#3d443f] dark:text-[#d0d4cf]';
  const card = 'bg-[#f8f9f7] border rounded-xl dark:bg-[#202421] ' + palette.border;
  const panel = 'bg-white rounded-2xl border dark:bg-[#1d211e] ' + palette.border;

  return {
    ...palette,
    card,
    nameB: neutralTeam,
    score: 'text-[#262b27] dark:text-[#ecefe9]',
    scoreA: palette.nameA,
    scoreB: palette.nameA,
    colon: 'text-[#a7ada8] dark:text-[#5b625c]',
    sub: palette.chip,
    page: 'bg-[#f2f4f0] text-[#20251f] dark:bg-[#141715] dark:text-[#ecefe9]',
    nav: 'bg-[#202923] text-white border-b ' + palette.navBorder,
    panel,
    panelIcon: 'rounded-lg ' + palette.icon,
    heading: 'text-[#242a24] dark:text-[#ecefe9]',
    btn: palette.flipBtn + ' rounded-lg',
    modalCard: panel,
  };
}

export const HUD_SKINS: HudSkin[] = PALETTES.map(createSkin);

export function getHudSkin(id: string | null | undefined): HudSkin {
  return HUD_SKINS.find((skin) => skin.id === id) ?? HUD_SKINS[0];
}
