<div align="center">

# 🧰 Xiangming Skills

#### 向明的 skills 技能仓库，用来提高效率

[![License](https://img.shields.io/badge/License-MIT-3B82F6?style=for-the-badge)](./LICENSE)
[![Skills](https://img.shields.io/badge/Skills-1-10B981?style=for-the-badge)](#-skills)
[![AgentSkills](https://img.shields.io/badge/AgentSkills-Standard-8B5CF6?style=for-the-badge)](https://agentskills.io)

![Claude Code](https://img.shields.io/badge/Claude_Code-Skill-D97706?style=flat-square&logo=anthropic&logoColor=white)
![Codex](https://img.shields.io/badge/Codex-Skill-10B981?style=flat-square&logo=openai&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-Compatible-3B82F6?style=flat-square)

</div>

这里放的都是我自己在用、跑通过的 skill。每一个都写清楚了流程、规范和检查脚本，交给 Agent 之后，它会按固定标准把活干完，检查不过就不交付。

每个 Skill 都是 Agent 能直接加载的结构化指令集，遵循 [Agent Skills](https://agentskills.io) 开放标准。Claude Code、Codex、Cursor 等支持该标准的 Agent 都能装。

---

## 📋 目录

| 名字 | 一句话 | 示例 |
|---|---|---|
| 🎞️ [**gzh-motion-diagram（公众号动态图解）**](#gzh-motion-diagram) | 把技术文章里的关键知识点做成公众号动态图解（GIF + MP4），统一视觉、自动检查 | [双层架构](./gzh-motion-diagram/examples/01-双层架构.gif) |

---

## 📦 安装方式

在 Claude Code、Codex 等支持 Agent Skills 的工具里，直接说：

```
帮我安装这个 skill：https://github.com/Hiwoniu/xiangming-skills/tree/main/<skill-name>
```

把 `<skill-name>` 换成你想装的那个，比如 `gzh-motion-diagram`。

也可以手动装（以 Claude Code 为例）：

```bash
git clone https://github.com/Hiwoniu/xiangming-skills.git
cp -r xiangming-skills/gzh-motion-diagram ~/.claude/skills/
```

你的 Agent 不支持 Skill 也没关系：把对应目录的 `SKILL.md` 当成项目规则文件（或直接贴进对话）让 Agent 照着执行。有 `PROMPT.md` 的 skill，可以直接复制里面的提示词交给 Agent。

---

## ✨ Skills

<a id="-skills"></a>

<a id="gzh-motion-diagram"></a>

<table>
<tr><td>

### 🎞️ gzh-motion-diagram（公众号动态图解）

> *"一张图解只讲一个知识点，不看字也能看懂。"*

**它只做一件事：把文章里的一个知识点，做成一张能直接放进公众号正文的动图。**

一张图解 = 一个 HyperFrames 工程 = 一个 GIF（正文用）+ 一个 MP4（视频号 / 备用）。

![示例：双层架构](./gzh-motion-diagram/examples/01-双层架构.gif)

**为什么要做成 skill**

让 AI 直接"画个动图"，每张风格都不一样：配色漂、字号乱、元素互相遮挡，GIF 动辄十几 MB 传不上去。这个 skill 的核心是**约束**：视觉规范、分镜规则、硬性规则都已经写死，Agent 只负责在约束内把知识点讲清楚，不会每张重新设计一遍风格。

**固定流程，不许跳步**

| 步骤 | 做什么 | 产出 |
|---|---|---|
| 1 | **分镜**：先想清楚每一幕讲什么、观众看到什么 | `storyboard.md` |
| 2 | **实现**：按模板和设计规范写 HTML + GSAP 动画 | `index.html` |
| 3 | **自动检查**：`check.sh` 一键跑审计、布局检查、关键帧快照、渲染、压 GIF | GIF + MP4 + 复核图 |
| 4 | **人工复核**：逐帧看复核图，对照检查清单签字 | `REVIEW.md` |

**硬性规则（节选）**

- 颜色只用设计规范里的 token，字号 ≥ 24px，手机上也看得清
- 切场时刻文字不许被遮挡，同一时刻画面上最多 2 处在动
- 画面里每个事实、数字都要能在原文里找到出处，不夸大、不编造
- GIF 宽 900px、≤ 5MB、≤ 300 帧，公众号能直接上传
- 规则分🤖自动检查和👁人工复核两类，任何一条不满足，都不算完成

**依赖**

- Node.js ≥ 18、ffmpeg、能联网（首次运行会通过 `npx -y hyperframes@0.8.226` 下载渲染器和 Chromium）
- 磁盘可用空间 ≥ 1GB（渲染器低于 1GB 会拒绝渲染）
- 中文字体：按 PingFang SC → Hiragino Sans GB → Noto Sans SC 顺序取用。macOS 自带前两个；Linux / Windows 请安装 Noto Sans SC，否则排版会和示例有差异

**自定义**

- **水印署名**：默认是"向明 · <系列名>图解 NN"。换成你自己的名字，只需改 `index.html` 里 `.brand` 的文字。
- **示例说明**：`examples/01-双层架构` 是根据 DeepSeek 公开文章《Super-agent 设计探索》做的解读图解，用来演示写法和节奏；原文不在本仓库内。

**怎么触发**

```
给这篇文章做几张动态图解
把这个知识点做成 GIF 图解
按之前的风格做系列图解的下一张
```

不适合：做普通视频 / 宣传片、静态配图、公众号排版。

→ [SKILL.md](./gzh-motion-diagram/SKILL.md) · [PROMPT.md](./gzh-motion-diagram/PROMPT.md) · [示例工程](./gzh-motion-diagram/examples/01-双层架构/)

</td></tr>
</table>

---

## 🛠️ 维护标准

这个仓库会持续加 skill、改 skill。下面这些规矩，新增和修改都要守住。

### 1. 目录结构

每个 skill 一个顶层文件夹，名字用小写短横线（`kebab-case`），结构统一：

```
<skill-name>/
├── SKILL.md          # 必需。frontmatter 含 name、description（写清触发场景和不适用场景）
├── PROMPT.md         # 可选。给不支持 Skill 的 Agent 直接复制的提示词
├── references/       # 可选。规范、规则、检查清单等细节文档
├── scripts/          # 可选。检查 / 构建脚本
├── assets/           # 可选。模板等静态资源
└── examples/         # 建议。至少一个跑通的完整示例
```

- `SKILL.md` 只写流程和入口，细节放 `references/`，按需加载。
- 文档里引用的路径一律用相对路径，引用的文件必须真实存在。

### 2. 上线标准

一个 skill 要进仓库，必须满足：

- **自己真用过**：在实际项目里跑通过，不收录没用过的东西。
- **有示例**：`examples/` 里至少有一个完整产出，能让别人看到效果。
- **有检查**：能自动检查的规则写成脚本，不能自动检查的写进检查清单。
- **只收自己的**：第三方 skill 不放进本仓库，也不在文档里依赖它。

### 3. 隐私脱敏

公开仓库，提交前必须过一遍：

- 不出现本机绝对路径（`/Users/...`、`/home/...`），示例路径用 `~/notes/...` 这类通用写法
- 不出现个人邮箱、手机号、公司名、工作身份、内部系统地址
- 不出现 API Key、Token、Cookie 等任何凭证
- 示例图片 / 视频不带个人信息和元数据
- 仓库用独立的 git 身份提交（作者"向明" + GitHub noreply 邮箱），不用工作身份

### 4. 同步流程

本地 skill 目录是源头，仓库是发布副本，不在仓库里直接改 skill 内容：

```bash
SKILLS_SRC=<本地 skills 目录> bash sync.sh
```

`sync.sh` 会同步列表里的 skill、排除临时产物（`_review/`、`.hyperframes/`、`.DS_Store`），并自动扫描本机绝对路径，发现就中断。新增 skill 时，把名字加进 `sync.sh` 的 `for s in ...` 列表。

### 5. 提交前验证

- 有检查脚本的 skill，改完先用示例完整跑一遍（如 `gzh-motion-diagram` 跑 `scripts/check.sh`），全部通过再提交
- 重新渲染前删掉旧产物，避免检查脚本拿旧文件误判通过
- 外部依赖固定版本（如 `hyperframes@0.8.226`），升级版本要重跑示例确认无回归，并在 SKILL.md 里同步改版本号
- 新增 skill 时同步更新本 README：目录表、Skill 介绍卡片、Skills 数量徽章

### 6. 提交规范

提交信息格式：`<类型>: <说明>`，类型用 `feat`（新增 skill / 能力）、`fix`（修问题）、`docs`（文档）、`refactor`（重构）、`chore`（杂项）。

- AI 生成的提交，标题必须以 `[AI]` 开头，例如 `[AI] feat: 新增 xxx skill`
- 一次提交只做一件事，skill 改动和 README 改动可以一起提，但不要混进无关修改

---

## 🌟 关于

我是向明。这些 skill 是我平时写文章、做内容时自己在用的，开源出来，如果对你有帮助，给个 ⭐ 就行。有问题或建议，欢迎在 Issues 里说一声。

---

<div align="center">

[MIT License](./LICENSE) · 自由使用 / 修改 / 再分发

Made by 向明 · [@Hiwoniu](https://github.com/Hiwoniu)

</div>
