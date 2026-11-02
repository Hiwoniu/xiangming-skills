#!/usr/bin/env node
// 静态审计：检查 hard-rules.md 里标 🤖 的规范类规则。
// 用法：node audit.mjs <工程目录或 index.html>
// 退出码：0 = 通过，1 = 有错误
import fs from "node:fs";
import path from "node:path";

const arg = process.argv[2];
if (!arg) { console.error("用法：node audit.mjs <工程目录|index.html>"); process.exit(2); }
const file = fs.statSync(arg).isDirectory() ? path.join(arg, "index.html") : arg;
const src = fs.readFileSync(file, "utf8");

const errors = [];
const warns = [];
const err = (rule, msg) => errors.push(`✗ [${rule}] ${msg}`);
const warn = (rule, msg) => warns.push(`⚠ [${rule}] ${msg}`);
const lineOf = (idx) => src.slice(0, idx).split("\n").length;

const scriptText = [...src.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join("\n");
const styleText = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
const stripTags = (s) => s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
// 字宽：汉字/全角 = 1，ASCII = 0.55
const width = (s) => [...s].reduce((w, ch) => w + (ch.charCodeAt(0) < 0x2000 ? 0.55 : 1), 0);

// ---------- A 结构 ----------
const root = src.match(/<div[^>]*data-composition-id="([^"]+)"[^>]*>/);
if (!root) err("A1", "找不到 data-composition-id 根节点");
else {
  const tag = root[0];
  const attr = (n) => (tag.match(new RegExp(`${n}="([^"]*)"`)) || [])[1];
  if (root[1] !== "main") err("A1", `data-composition-id 必须是 "main"，现在是 "${root[1]}"`);
  if (attr("data-width") !== "1080" || attr("data-height") !== "900") err("A1", `画布必须是 1080×900，现在是 ${attr("data-width")}×${attr("data-height")}`);
  if (attr("data-start") !== "0") err("A1", "data-start 必须是 0");
  const dur = parseFloat(attr("data-duration"));
  if (!(dur >= 20 && dur <= 30)) err("A2", `data-duration 必须在 20–30 之间，现在是 ${dur}`);
  const DUR = parseFloat((scriptText.match(/const\s+DUR\s*=\s*([\d.]+)/) || [])[1]);
  if (DUR !== dur) err("A2", `脚本里的 DUR (${DUR}) 和 data-duration (${dur}) 不一致`);

  // A4 / A5 场景
  const scenes = [...src.matchAll(/<section[^>]*class="([^"]*\bscene\b[^"]*)"[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
  if (scenes.length < 2 || scenes.length > 5) err("A4", `场景数必须是 2–5 个（含总结页），现在是 ${scenes.length}`);
  scenes.forEach((m, i) => {
    const last = i === scenes.length - 1;
    if (last && !/\bsummary\b/.test(m[1])) err("A4", `最后一个场景 #${m[2]} 必须带 summary class`);
    if (!last && /\bsummary\b/.test(m[1])) err("A4", `只有最后一个场景能是 summary，#${m[2]} 不是最后一个`);
    if (!last && !/class="verdict"/.test(m[3])) err("A4", `场景 #${m[2]} 缺少 .verdict 结论条`);
    if (!last) {
      for (const k of ["pill", "title", "sub"]) if (!new RegExp(`class="${k}"`).test(m[3])) err("D1", `场景 #${m[2]} 缺少 .${k}`);
      if (!/header\(/.test(scriptText)) err("D1", "没有调用 header() 给标题区加入场");
    }
    // C3 文案字宽
    const grab = (cls) => [...m[3].matchAll(new RegExp(`class="${cls}"[^>]*>([\\s\\S]*?)</div>`, "g"))].map((x) => stripTags(x[1]));
    grab("title").forEach((t) => { if (width(t) > 17) err("C3", `#${m[2]} 标题 "${t}" 字宽 ${width(t).toFixed(1)} > 17`); });
    grab("sub").forEach((t) => { if (width(t) > 34) err("C3", `#${m[2]} 副标题 "${t}" 字宽 ${width(t).toFixed(1)} > 34`); });
    grab("chip (?:ok|no)").forEach((t) => { if (width(t) > 14) err("C3", `#${m[2]} chip "${t}" 字宽 ${width(t).toFixed(1)} > 14`); });
  });

  const sceneTable = scriptText.match(/const\s+SCENES\s*=\s*(\[[\s\S]*?\]);/);
  if (!sceneTable) err("A5", "找不到 const SCENES = [...] 时间表");
  else {
    const times = [...sceneTable[1].matchAll(/\[\s*"#([\w-]+)"\s*,\s*([\d.]+)\s*\]/g)].map((x) => [x[1], parseFloat(x[2])]);
    if (times.length !== scenes.length) err("A5", `SCENES 有 ${times.length} 项，但 HTML 里有 ${scenes.length} 个场景`);
    const lastT = times.length ? times[times.length - 1][1] : 0;
    if (dur - lastT < 4) err("A5", `总结页只有 ${(dur - lastT).toFixed(2)} 秒，至少要 4 秒`);
    for (let i = 1; i < times.length; i++) {
      const len = times[i][1] - times[i - 1][1];
      if (len < 5) err("R3", `场景 #${times[i - 1][0]} 只有 ${len.toFixed(1)} 秒，太短（≥ 5 秒）`);
      if (len > 11) warn("R3", `场景 #${times[i - 1][0]} 有 ${len.toFixed(1)} 秒，偏长（建议 6–10 秒）`);
    }
  }
}
if (!/window\.__timelines\[\s*["']main["']\s*\]\s*=\s*tl/.test(scriptText)) err("A3", '缺少 window.__timelines["main"] = tl');
const brand = src.match(/class="brand"[^>]*>([^<]*)</);
if (!brand) err("A6", "缺少 .brand 水印");
else if (!/^\S.* · .+\d{2}$/.test(brand[1].trim())) err("A6", `水印必须是"<署名> · <系列名>图解 NN"（默认署名：向明），现在是 "${brand[1].trim()}"`);

// ---------- B 确定性 ----------
const banned = [
  [/Math\.random/, "Math.random"], [/Date\.now/, "Date.now"], [/new Date\b/, "new Date"],
  [/performance\.now/, "performance.now"], [/setTimeout/, "setTimeout"], [/setInterval/, "setInterval"],
  [/requestAnimationFrame/, "requestAnimationFrame"], [/\basync\b/, "async"], [/\bawait\b/, "await"], [/\bPromise\b/, "Promise"],
];
banned.forEach(([re, name]) => { const m = scriptText.match(re); if (m) err("B1", `禁止使用 ${name}`); });
if (/repeat\s*:\s*-1/.test(scriptText)) err("B2", "禁止 repeat: -1");
if (/tl\.(to|from|fromTo|set)\([^;]*\b(display|visibility)\s*:/.test(scriptText)) err("B3", "禁止动画 display / visibility");
if (/\btl\.call\(/.test(scriptText)) err("B3", "禁止 tl.call，改用 onUpdate 写法（参考 counter）");

// ---------- C 视觉规范 ----------
const rootBlock = (styleText.match(/:root\s*\{[\s\S]*?\}/) || [""])[0];
const allowed = new Set([...rootBlock.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0].toUpperCase()).concat(["#FFF", "#FFFFFF"]));
const rootIdx = rootBlock ? src.indexOf(rootBlock) : -1;
for (const m of src.matchAll(/(?<=[\s:"'(,])#[0-9a-fA-F]{6}\b|(?<=[\s:"'(,])#[0-9a-fA-F]{3}\b(?![\w-])/g)) {
  if (rootIdx >= 0 && m.index >= rootIdx && m.index < rootIdx + rootBlock.length) continue;
  if (!allowed.has(m[0].toUpperCase())) err("C1", `第 ${lineOf(m.index)} 行出现非规范色值 ${m[0]}，改用 var(--token)`);
}
for (const m of src.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) {
  const k = `${m[1]},${m[2]},${m[3]}`;
  if (k !== "232,89,12" && k !== "31,35,40") err("C1", `第 ${lineOf(m.index)} 行 rgba(${k}) 不在许可范围（只许 accent 232,89,12 / ink 31,35,40）`);
}
for (const m of src.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/g)) if (parseFloat(m[1]) < 24) err("C2", `第 ${lineOf(m.index)} 行字号 ${m[1]}px < 24px`);
for (const m of src.matchAll(/fontSize\s*:\s*["'](\d+(?:\.\d+)?)px["']/g)) if (parseFloat(m[1]) < 24) err("C2", `第 ${lineOf(m.index)} 行字号 ${m[1]}px < 24px`);
for (const m of src.matchAll(/font\s*:\s*\d+\s+(\d+)px/g)) if (parseFloat(m[1]) < 24) err("C2", `第 ${lineOf(m.index)} 行字号 ${m[1]}px < 24px`);
if (/<br\s*\/?>/i.test(src)) err("C4", "禁止 <br>");
for (const m of scriptText.matchAll(/tl\.(?:to|from|fromTo|set)\(\s*["'`]([^"'`]+)["'`]/g)) {
  if (/(^|[\s,])(\.bg-|#bg)/.test(m[1])) err("C5", `背景层不许动：${m[1]}`);
}
const emoji = src.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2B50}\u{2B55}]/u);
if (emoji) err("C6", `禁止 emoji：${emoji[0]}`);

// ---------- 输出 ----------
const rel = path.relative(process.cwd(), file) || file;
console.log(`◆ audit ${rel}`);
warns.forEach((w) => console.log("  " + w));
errors.forEach((e) => console.log("  " + e));
console.log(errors.length ? `◇ ${errors.length} 个错误，${warns.length} 个提醒 —— 不通过` : `◇ 通过（${warns.length} 个提醒）`);
process.exit(errors.length ? 1 : 0);
