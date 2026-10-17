#!/usr/bin/env node
/**
 * 生成渐变占位图标（无第三方依赖，手工编码 PNG）。
 * 渐变圆底 + 白色四角星光，逐像素超采样抗锯齿渲染。
 *
 * ⚠️ 会覆盖 public/icon/*.png。当前仓库内的正式图标由 assets/logo-source.jpg 导出，
 *    非必要不要重跑本脚本。
 * 运行：node scripts/gen-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'icon');
const SIZES = [16, 32, 48, 128];

/* ---------- PNG 编码 ---------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePNG(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter: None
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- 绘制 ---------- */
const STOPS = [
  [0x63, 0x66, 0xf1], // #6366F1 靛蓝
  [0x8b, 0x5c, 0xf6], // #8B5CF6 紫
  [0x06, 0xb6, 0xd4], // #06B6D4 青
];

function gradAt(t) {
  t = Math.min(1, Math.max(0, t));
  const seg = t < 0.5 ? 0 : 1;
  const local = (t - seg * 0.5) / 0.5;
  const a = STOPS[seg];
  const b = STOPS[seg + 1];
  return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * local));
}

/** 四角星光（凹边星形，用 8 顶点多边形逼近） */
function sparklePoly(outer, inner) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 4;
    const r = i % 2 === 0 ? outer : inner;
    pts.push([Math.cos(ang) * r, Math.sin(ang) * r]);
  }
  return pts;
}

function inPoly(px, py, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function renderIcon(size) {
  const SS = 4; // 每像素 4x4 超采样
  const rgba = new Uint8Array(size * size * 4);
  const star = sparklePoly(0.185, 0.055);
  const R = 0.46;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, hit = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = (x + (sx + 0.5) / SS) / size - 0.5;
          const v = (y + (sy + 0.5) / SS) / size - 0.5;
          if (Math.hypot(u, v) > R) continue;
          hit++;
          if (inPoly(u, v, star)) {
            r += 255; g += 255; b += 255;
          } else {
            const [cr, cg, cb] = gradAt((u + v + 1) / 2);
            r += cr; g += cg; b += cb;
          }
        }
      }
      const i = (y * size + x) * 4;
      if (hit > 0) {
        rgba[i] = Math.round(r / hit);
        rgba[i + 1] = Math.round(g / hit);
        rgba[i + 2] = Math.round(b / hit);
        rgba[i + 3] = Math.round((hit / (SS * SS)) * 255);
      }
    }
  }
  return rgba;
}

mkdirSync(OUT_DIR, { recursive: true });
for (const size of SIZES) {
  const png = encodePNG(size, size, renderIcon(size));
  const file = join(OUT_DIR, `${size}.png`);
  writeFileSync(file, png);
  console.log(`生成 ${file}（${png.length} 字节）`);
}
