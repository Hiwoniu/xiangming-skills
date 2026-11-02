# 硬性规则（违反任意一条 = 不合格）

标 🤖 的由 `scripts/audit.mjs` / `hyperframes check` 自动查；标 👁 的必须在人工复核时逐条确认。自动检查通过**不等于**合格。

## A. 结构

- 🤖 A1 根节点 `data-composition-id="main"`、`data-width="1080"`、`data-height="900"`、`data-start="0"`。
- 🤖 A2 `data-duration` 在 20–30 之间，并且等于脚本里的 `DUR`。
- 🤖 A3 必须有 `window.__timelines["main"] = tl` 注册。
- 🤖 A4 场景用 `<section class="scene" id="sN">`，2–5 个；最后一个是总结页（`.scene.summary`），其余每个场景都要有 `.verdict` 结论条。
- 🤖 A5 总结页从开始到片尾 **≥ 4 秒**（保证金句读得完；GIF 循环时首尾衔接）。
- 🤖 A6 右上角水印 `.brand` 存在，格式为 `<署名> · <系列名>图解 NN`：以署名加 ` · ` 开头（默认署名「向明」，可换成你自己的），以两位数编号结尾。
- 👁 A7 只修改模板里标 `【改这里】` 的区域，以及 `<style>` 末尾的"本图解专用"区。

## B. 确定性（渲染可复现）

- 🤖 B1 禁止 `Math.random`、`Date.now`、`new Date`、`performance.now`、`setTimeout`、`setInterval`、`requestAnimationFrame`、`async`、`await`、`Promise`。
- 🤖 B2 禁止 `repeat: -1`；循环次数必须是算好的有限值。
- 🤖 B3 禁止动画 `display`、`visibility`；禁止 `tl.call`（倒放时不可靠，用 `counter()` 这类 onUpdate 写法）。
- 🤖 B4 时间线必须同步构建，不得放在回调里。

## C. 视觉规范

- 🤖 C1 颜色只用 `design-system.md` 第 3 节的 token。`:root` 以外不得出现其他十六进制色值（`#fff` 除外）；rgba 只许 accent 色（232,89,12）和 ink 色（31,35,40）。
- 🤖 C2 任何字号 ≥ 24px（CSS 和 JS 内联样式都查；hyperframes check 的手机可读下限是 23px）。
- 🤖 C3 标题 ≤ 17 个汉字宽，副标题 ≤ 34 个汉字宽，结论 chip ≤ 14 个汉字宽（英文/数字按 0.55 个汉字宽计）。
- 🤖 C4 禁止 `<br>`，换行交给 `max-width`。
- 🤖 C5 背景层（`.bg-*`、`#bg*`）不得出现在任何 tween 里。
- 🤖 C6 禁止 emoji（✓ ✗ ? 等符号字符可以用）。
- 👁 C7 概念→视觉映射与 `design-system.md` 第 4 节一致：同一概念在全系列用同一元件、同一颜色。
- 👁 C8 accent 色一张图只给一个"主角"（通常是正确方案或协调者），不许拿来当装饰色。

## D. 动效

- 🤖 D1 每个场景的药丸、标题、副标题都有入场动画（用 `header()`）。
- 👁 D2 舞台上每个可见元素都有入场动画，不许凭空出现（切场后立刻可见的除外）。
- 👁 D3 切场前不许把场景内容淡出，退场交给切场擦除。
- 👁 D4 同一时刻画面上最多 2 处在动（背景不算）。读者眼睛只能跟一个焦点。
- 👁 D5 结论条必须在切场前 ≥ 2.5 秒出现，切走前所有元素都已到位、画面定格。
- 🤖 D6 `hyperframes check --at-transitions` 必须 0 error（含 text_occluded、对比度）。warning 处理规则：
  - **自动豁免**（GIF 本来就没声音，单文件是规范要求）：`film_silent`、`audio_none`、`composition_file_too_large`。
  - **必须修复，不许豁免**：`line_unread`（文字停留时间不够）、`text_below_floor`、所有对比度问题。
  - **可以豁免但必须说明**：`content_overlap` 只限"有意堆叠"的表现（例如一堆回复砸向用户），要在 REVIEW.md 的"有意为之的例外"里写清楚是哪几个元素、为什么。
  - 其余 warning 一律修复。

## E. 内容

- 👁 E1 画面里的每个事实、数字、术语都能在 `storyboard.md` 里找到原文行号。
- 👁 E2 不夸大、不编造：原文写"约 30%"，画面就不能写"30%"；原文没有的数字不许出现。
- 👁 E3 一张图只讲一个知识点；和下一张图相关的内容只能点到为止，不许抢戏。
- 👁 E4 每个场景单独截一帧（定格帧），不看动画也能看懂这一幕在说什么。

## F. 产物

- 🤖 F1 GIF ≤ 5MB，≤ 300 帧，宽 900，无限循环。
- 🤖 F2 MP4 时长与 `data-duration` 相差 ≤ 0.2 秒。
- 👁 F3 `REVIEW.md` 存在，并且所有条目都已填写。
