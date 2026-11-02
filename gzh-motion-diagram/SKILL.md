---
name: gzh-motion-diagram
description: 把技术文章里的关键知识点做成公众号可用的动态图解（GIF + MP4）。基于 HyperFrames（HTML + GSAP 渲染），统一的"向明图解"视觉规范，固定的分镜→实现→自动检查→人工复核流程，检查不过不准交付。触发场景：用户要给文章/知识点做"动态图解""动画图解""动图""GIF 图解"，或要按既定风格继续做系列图解的下一张。不用于：做普通视频/宣传片、静态配图、公众号排版。
---

# 公众号动态图解（向明图解）

一张图解 = 一个 HyperFrames 工程 = 一个 GIF（正文用）+ 一个 MP4（视频号/备用）。

本 skill 的核心是**约束**：视觉规范、分镜规则、硬性规则都已经定死，你的工作是在约束内把知识点讲清楚，而不是重新设计风格。**任何一条硬性规则不满足，都不算完成。**

参考成品：`examples/01-双层架构/index.html`（及同目录 `storyboard.md`）。动手前必须先完整读一遍它，新图解的写法、节奏、元件用法向它看齐。

## 工作流（必须按顺序，不得跳步）

### 第 0 步：准备

1. 确认输入：原文路径 + 本次要做的知识点（编号、名称、对应原文章节）。缺任何一项就问用户，不要猜。
2. 环境检查：`node -v`（≥18）、`ffmpeg -version`、`npx -y hyperframes@0.8.226 --version`。HyperFrames 版本**固定 0.8.226**，不要用 latest。
3. 读：本文件 → `references/design-system.md` → `references/hard-rules.md` → `examples/01-双层架构/`。

### 第 1 步：选点（仅当用户没给知识点清单时）

读 `references/storyboard.md` 的"选点标准"，输出一张清单表（编号 / 原文章节 / 动画讲什么 / 为什么必须动），分"必做 / 推荐 / 可选 / 不做"四档，**停下来等用户确认**，不要自行开做。

### 第 2 步：写分镜 `storyboard.md`（先文字，后代码）

在工程目录里先写 `storyboard.md`，格式严格按 `references/storyboard.md` 的模板：
- 每个场景：时间段、编号药丸、标题、副标题、舞台动作（带秒数）、结论条。
- **每个事实、数字、术语都要标原文行号**（如 `[原文 L84-87]`）。写不出出处的内容不准进画面。
- 写完自查分镜规则（场景数、时长、字数上限），不过就改，改到过为止。

### 第 3 步：实现

1. 建目录：`<原文所在目录>/<系列名>图解/NN-名称/`，把 `assets/template.html` 复制为其中的 `index.html`。
2. **只改模板里标 `【改这里】` 的区域**：场景 HTML、`SCENES` 时间表、每个场景的动画函数、`DUR`。样式 token、helper 函数、切场逻辑、背景层不许改；需要新元件时，在 `<style>` 末尾的"本图解专用"区追加，并且只能用已有颜色 token。
3. 写法：先按"最清楚的那一帧"摆好静态布局，再用 `tl.from` / `tl.fromTo` 加入场。规则见 `references/hard-rules.md`。

### 第 4 步：自动检查（必须全绿）

```bash
bash <skill目录>/scripts/check.sh <工程目录>
```

脚本依次执行：静态审计（`audit.mjs`，规范类硬规则）→ `hyperframes check`（lint + 运行时 + 排版）→ 关键帧截图 → 渲染 MP4 → 转 GIF → 体积/帧数/尺寸校验 → 生成手机尺寸预览图。任何一步失败脚本退出码非 0，**修好后从头重跑**，不要只跑某一步。

### 第 5 步：人工复核（必须真的看图）

脚本跑通后，用看图工具**逐张打开**这三张图，不准只看文件名或日志就宣布通过：
- `<工程>/_review/snapshots/contact-sheet*.jpg`（关键帧：每个场景的中段 + 切场前定格帧，可能分成多张，全部要看）
- `<工程>/_review/gif-sheet.png`（GIF 实际成品抽帧）
- `<工程>/_review/phone-sheet.png`（缩到手机宽 375px 的效果）

按 `references/review-checklist.md` 逐条判定，结果写进 `<工程>/REVIEW.md`（模板在该文件里）。任何一条 ✗ → 回第 3 步修改 → 重跑第 4 步 → 重新复核。最多循环 3 轮，第 3 轮仍有 ✗ 就停下，把剩余问题如实报告给用户。

### 第 6 步：交付

交付物（缺一不可）：
- `<系列名>图解/NN-名称.gif`、`NN-名称.mp4`
- `NN-名称/index.html`、`storyboard.md`、`REVIEW.md`

向用户报告：GIF 体积 / 帧数 / 时长、每个场景一句话、`REVIEW.md` 里所有"有意为之"的例外及理由、尚未验证的事项（例如"未在公众号后台实际上传"）。**不得宣称做过没做的检查。**

## 文件索引

| 文件 | 用途 | 何时读 |
|---|---|---|
| `references/design-system.md` | 画布、配色 token、字号、元件库、概念→视觉映射 | 第 0 步必读 |
| `references/hard-rules.md` | 全部硬性规则（违反即不合格） | 第 0 步必读，第 3 步对照 |
| `references/storyboard.md` | 选点标准、分镜规则、分镜模板 | 第 1、2 步 |
| `references/review-checklist.md` | 人工复核清单 + REVIEW.md 模板 | 第 5 步 |
| `assets/template.html` | 起步模板（含 helper、切场、背景、元件样式） | 第 3 步复制 |
| `scripts/check.sh` | 一键检查 + 渲染 + 转码 | 第 4 步 |
| `scripts/audit.mjs` | 静态审计（被 check.sh 调用，也可单独跑） | 第 4 步 |
| `examples/01-双层架构/` | 参考成品（源码 + 分镜 + REVIEW） | 第 0 步必读 |
| `PROMPT.md` | 给人看的：交给其他 Agent 时复制的提示词 | 不用读 |
