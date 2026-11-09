// Generates placeholder "archive plate" illustrations for the dummy catalogue.
// Output: scripts/seed/out/*.jpg (gitignored). Replace with real photography later.
// Usage: node scripts/seed/generate-plates.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {execSync} from 'node:child_process';

// Use a local playwright if installed, otherwise the globally installed one.
async function loadChromium() {
  try {
    return (await import('playwright')).chromium;
  } catch {
    const root = execSync('npm root -g').toString().trim();
    const mod = await import(pathToFileURL(path.join(root, 'playwright/index.js')).href);
    return (mod.default ?? mod).chromium;
  }
}

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'out');
fs.mkdirSync(out, {recursive: true});
const fontDir = path.resolve(here, '../../node_modules/@fontsource');
const font = (p) =>
  `data:font/woff2;base64,${fs.readFileSync(path.join(fontDir, p)).toString('base64')}`;

const W = 1600;
const H = 2000;
const C = {ink: '#0b0b0b', cream: '#F7F5F2', white: '#ffffff', green: '#57E38F'};

// --- Shapes -----------------------------------------------------------------
const torso =
  'M 760 340 C 700 350 610 360 590 400 C 570 450 585 500 590 530 C 600 620 660 680 660 720 C 660 780 590 850 580 900 C 575 950 590 990 600 1000 L 1000 1000 C 1010 990 1025 950 1020 900 C 1010 850 940 780 940 720 C 940 680 1000 620 1010 530 C 1015 500 1030 450 1010 400 C 990 360 900 350 840 340 Z';

const dressForm = (stroke, {pole = true} = {}) => `
  <g fill="none" stroke="${stroke}" stroke-width="3">
    <circle cx="800" cy="285" r="22"/>
    <rect x="770" y="305" width="60" height="38" rx="6"/>
    <path d="${torso}"/>
    <path d="M 800 345 L 800 1000" stroke-dasharray="6 10" opacity=".45"/>
    <path d="M 640 730 Q 800 760 960 730" opacity=".35"/>
    ${
      pole
        ? `<path d="M 800 1000 L 800 1720"/><path d="M 800 1720 L 640 1830 M 800 1720 L 960 1830 M 800 1720 L 800 1850"/>
           <circle cx="640" cy="1836" r="9"/><circle cx="960" cy="1836" r="9"/><circle cx="800" cy="1856" r="9"/>`
        : ''
    }
  </g>`;

const folds = (stroke, lines, opacity = 0.55) =>
  lines
    .map(
      (d) =>
        `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="2" opacity="${opacity}"/>`,
    )
    .join('');

function dress(stroke, fill) {
  const skirt =
    'M 660 728 C 600 900 430 1300 260 1860 Q 520 1905 800 1895 Q 1080 1905 1340 1860 C 1170 1300 1000 900 940 728 Z';
  const bodice =
    'M 595 520 C 640 468 722 478 800 548 C 878 478 960 468 1005 520 C 995 620 940 680 940 730 L 660 730 C 660 680 605 620 595 520 Z';
  const skirtFolds = [
    'M 700 735 C 640 1100 520 1500 430 1880',
    'M 750 738 C 720 1150 660 1550 610 1895',
    'M 800 740 C 800 1150 800 1550 800 1896',
    'M 850 738 C 880 1150 940 1550 990 1895',
    'M 900 735 C 960 1100 1080 1500 1170 1880',
  ];
  const boning = [
    'M 700 515 C 690 600 690 680 700 728',
    'M 800 560 L 800 730',
    'M 900 515 C 910 600 910 680 900 728',
  ];
  return `${dressForm(stroke, {pole: false})}
    <path d="${skirt}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    <path d="${bodice}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    ${folds(stroke, skirtFolds)}${folds(stroke, boning, 0.4)}
    <path d="M 660 730 Q 800 745 940 730" fill="none" stroke="${stroke}" stroke-width="5"/>`;
}

function veil(stroke, fill) {
  const head = `
    <g fill="none" stroke="${stroke}" stroke-width="3">
      <ellipse cx="800" cy="390" rx="105" ry="135"/>
      <path d="M 750 515 L 745 600 C 700 620 640 640 620 660 M 850 515 L 855 600 C 900 620 960 640 980 660"/>
      <path d="M 800 600 L 800 1720 M 800 1720 L 640 1830 M 800 1720 L 960 1830 M 800 1720 L 800 1850"/>
    </g>`;
  const body =
    'M 770 262 C 620 380 470 900 360 1870 Q 580 1905 800 1898 Q 1020 1905 1240 1870 C 1130 900 980 380 830 262 Z';
  const scallops = Array.from({length: 22}, (_, i) => {
    const x = 360 + i * 40;
    return `<path d="M ${x} 1870 q 20 22 40 0" fill="none" stroke="${stroke}" stroke-width="2"/>`;
  }).join('');
  const lace = Array.from({length: 60}, (_, i) => {
    const t = i / 59;
    const x = 380 + t * 840 + Math.sin(i * 1.7) * 6;
    const y = 1790 + Math.cos(i * 2.3) * 22;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${3 + (i % 3)}" fill="none" stroke="${stroke}" stroke-width="1.5" opacity=".7"/>`;
  }).join('');
  const veilFolds = [
    'M 790 280 C 700 600 580 1200 500 1870',
    'M 800 280 C 780 700 740 1300 700 1890',
    'M 810 280 C 860 700 900 1300 930 1890',
    'M 820 280 C 940 600 1040 1200 1110 1875',
  ];
  return `${head}
    <path d="${body}" fill="${fill}" fill-opacity=".55" stroke="${stroke}" stroke-width="2.5"/>
    ${folds(stroke, veilFolds, 0.45)}${scallops}${lace}
    <path d="M 735 270 Q 800 240 865 270" fill="none" stroke="${stroke}" stroke-width="6"/>`;
}

function corset(stroke, fill) {
  const body =
    'M 595 520 C 700 565 900 565 1005 520 C 1000 620 940 680 940 720 C 940 790 1000 850 1012 885 L 800 968 L 588 885 C 600 850 660 790 660 720 C 660 680 600 620 595 520 Z';
  const bones = [
    'M 640 545 C 650 640 700 690 700 730 C 700 790 650 850 640 895',
    'M 720 560 C 730 650 750 700 750 730 C 750 800 730 870 725 928',
    'M 880 560 C 870 650 850 700 850 730 C 850 800 870 870 875 928',
    'M 960 545 C 950 640 900 690 900 730 C 900 790 950 850 960 895',
  ];
  const busk = Array.from(
    {length: 7},
    (_, i) =>
      `<circle cx="800" cy="${600 + i * 50}" r="6" fill="${stroke}"/>`,
  ).join('');
  return `${dressForm(stroke)}
    <path d="${body}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    ${folds(stroke, bones, 0.7)}
    <path d="M 800 560 L 800 968" stroke="${stroke}" stroke-width="3"/>${busk}
    <path d="M 600 530 C 700 580 900 580 1000 530" fill="none" stroke="${stroke}" stroke-width="2" stroke-dasharray="3 7"/>`;
}

function underskirt(stroke, fill) {
  const hoops = [0, 1, 2, 3, 4, 5, 6]
    .map((i) => {
      const y = 860 + i * 150;
      const rx = 170 + i * 68;
      return `<ellipse cx="800" cy="${y}" rx="${rx}" ry="${28 + i * 6}" fill="none" stroke="${stroke}" stroke-width="2.5"/>`;
    })
    .join('');
  const tapes = [-1, -0.6, -0.2, 0.2, 0.6, 1]
    .map(
      (k) =>
        `<path d="M ${800 + k * 130} 735 C ${800 + k * 200} 1100 ${800 + k * 420} 1500 ${800 + k * 578} 1760" fill="none" stroke="${stroke}" stroke-width="2" opacity=".6"/>`,
    )
    .join('');
  const tulle =
    'M 668 730 C 560 1000 430 1400 300 1800 Q 800 1860 1300 1800 C 1170 1400 1040 1000 932 730 Z';
  const ruffle = Array.from({length: 25}, (_, i) => {
    const x = 300 + i * 40;
    return `<path d="M ${x} 1800 q 20 26 40 0" fill="none" stroke="${stroke}" stroke-width="2"/>`;
  }).join('');
  return `${dressForm(stroke, {pole: false})}
    <path d="${tulle}" fill="${fill}" fill-opacity=".35" stroke="${stroke}" stroke-width="2" stroke-dasharray="2 6"/>
    ${hoops}${tapes}${ruffle}
    <rect x="655" y="715" width="290" height="30" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
}

// --- Plate composition ------------------------------------------------------
const garments = {dress, veil, corset, underskirt};

function plate({garment, n, title, theme, crop}) {
  const bg = theme === 'dark' ? C.ink : C.cream;
  const fg = theme === 'dark' ? C.cream : C.ink;
  const fill = theme === 'dark' ? C.ink : C.white;
  const viewBox = crop ?? `0 0 ${W} ${H}`;
  const art = garments[garment](fg, fill);
  return `<!doctype html><html><head><style>
    @font-face{font-family:Imbue;src:url(${font('imbue/files/imbue-latin-400-normal.woff2')})}
    @font-face{font-family:Questrial;src:url(${font('questrial/files/questrial-latin-400-normal.woff2')})}
    html,body{margin:0;background:${bg}}
    .p{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${bg};color:${fg}}
    svg{position:absolute;inset:0}
    .grain{position:absolute;inset:0;opacity:.13;mix-blend-mode:${theme === 'dark' ? 'screen' : 'multiply'}}
    .cap{position:absolute;font-family:Questrial;letter-spacing:.32em;text-transform:uppercase;font-size:26px}
    .logo{font-family:Imbue;font-size:44px;letter-spacing:.14em}
    .dot{display:inline-block;width:14px;height:14px;border-radius:50%;background:${C.green};margin-right:16px;vertical-align:middle}
  </style></head><body><div class="p">
    <svg viewBox="${viewBox}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid meet">${art}</svg>
    <svg class="grain" width="${W}" height="${H}"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>
    <div class="cap logo" style="top:70px;left:80px">TERRIBELLE</div>
    <div class="cap" style="top:86px;right:80px">Archive — N° ${String(n).padStart(3, '0')}</div>
    <div class="cap" style="bottom:80px;left:80px"><span class="dot"></span>${title}</div>
    <div class="cap" style="bottom:80px;right:80px">Placeholder plate</div>
  </div></body></html>`;
}

export const PLATES = [
  {file: 'dress-1', garment: 'dress', n: 1, title: 'Robe de mariée — study', theme: 'light'},
  {file: 'dress-2', garment: 'dress', n: 2, title: 'Robe de mariée — nocturne', theme: 'dark'},
  {file: 'dress-3', garment: 'dress', n: 3, title: 'Bodice detail', theme: 'light', crop: '450 380 700 875'},
  {file: 'veil-1', garment: 'veil', n: 4, title: 'Cathedral veil — study', theme: 'light'},
  {file: 'veil-2', garment: 'veil', n: 5, title: 'Cathedral veil — nocturne', theme: 'dark'},
  {file: 'veil-3', garment: 'veil', n: 6, title: 'Lace edge detail', theme: 'light', crop: '480 1290 640 800'},
  {file: 'corset-1', garment: 'corset', n: 7, title: 'Corset — study', theme: 'light', crop: '300 200 1000 1250'},
  {file: 'corset-2', garment: 'corset', n: 8, title: 'Corset — nocturne', theme: 'dark'},
  {file: 'corset-3', garment: 'corset', n: 9, title: 'Boning detail', theme: 'light', crop: '520 460 560 700'},
  {file: 'underskirt-1', garment: 'underskirt', n: 10, title: 'Crinoline underskirt — study', theme: 'light'},
  {file: 'underskirt-2', garment: 'underskirt', n: 11, title: 'Crinoline — nocturne', theme: 'dark'},
  {file: 'underskirt-3', garment: 'underskirt', n: 12, title: 'Hoop detail', theme: 'light', crop: '480 1120 640 800'},
];

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const chromium = await loadChromium();
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: W, height: H}});
  for (const p of PLATES) {
    await page.setContent(plate(p), {waitUntil: 'load'});
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({path: path.join(out, `${p.file}.jpg`), type: 'jpeg', quality: 86});
    console.log('wrote', p.file);
  }
  await browser.close();
}
