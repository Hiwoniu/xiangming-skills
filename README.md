# xiangming-skills

向明的 skills 技能仓库，用来提高效率。

这里的每个文件夹都是一个可以直接交给 AI Agent（Claude Code、Codex、Cursor 等）使用的 skill：写清楚了流程、规范和检查脚本，让 Agent 按固定标准把活干完。

## 技能列表

| Skill | 用途 |
|---|---|
| [gzh-motion-diagram](gzh-motion-diagram/) | 把技术文章里的关键知识点做成公众号动态图解（GIF + MP4）。固定视觉规范，按"分镜 → 实现 → 自动检查 → 人工复核"走，检查不过不交付。 |

![示例：双层架构](gzh-motion-diagram/examples/01-双层架构.gif)

## 安装

Claude Code：

```bash
git clone https://github.com/Hiwoniu/xiangming-skills.git
cp -r xiangming-skills/gzh-motion-diagram ~/.claude/skills/
```

其他 Agent：把对应的 skill 文件夹放进它能读到的目录，让它先读 `SKILL.md`。交给其他 Agent 时可直接复制 `gzh-motion-diagram/PROMPT.md` 里的提示词。

## gzh-motion-diagram 依赖

- Node.js ≥ 18、ffmpeg、能联网（首次运行会通过 `npx -y hyperframes@0.8.226` 下载渲染器和 Chromium）
- 磁盘可用空间 ≥ 1GB（渲染器低于 1GB 会拒绝渲染）
- 中文字体：按 PingFang SC → Hiragino Sans GB → Noto Sans SC 顺序取用。macOS 自带前两个；Linux / Windows 请安装 Noto Sans SC，否则排版会和示例有差异

## 自定义

- **水印署名**：默认是"向明 · <系列名>图解 NN"。换成你自己的名字，只需改 `index.html` 里 `.brand` 的文字，审计脚本只要求"<署名> · <系列名>图解 NN"的格式。
- **示例说明**：`examples/01-双层架构` 是根据 DeepSeek 公开文章《Super-agent 设计探索》做的解读图解，用来演示写法和节奏；原文不在本仓库内。
