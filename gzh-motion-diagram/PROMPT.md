# 给其他 Agent 的提示词

用法：把 `gzh-motion-diagram/` 整个文件夹放进对方 Agent 能读到的位置（Claude Code 可以放进 `~/.claude/skills/`，其他 Agent 放进工作目录即可），然后复制下面"提示词"一节，填好【】里的内容再发出去。

一次只交一张图。做完一张、确认没问题，再发下一张。这样省 token，出问题也好定位。

---

## 提示词

```text
你要按 skill「gzh-motion-diagram」为公众号文章做一张动态图解（GIF + MP4）。

【输入】
- skill 目录：【例：~/.claude/skills/gzh-motion-diagram】
- 原文：【例：~/notes/Super-agent 设计探索.md】
- 系列名：【例：Super-agent】（水印显示为"<署名> · 系列名 图解 NN"）
- 署名：【例：向明】（不填默认「向明」）
- 本次图解：编号【02】 名称【订阅直通】 对应原文【§3.2】
- 要讲清的一句话：【例：Worker 订阅事件后，后续消息不再经过 Router，直达 Worker】
- 输出目录：【例：~/notes/super-agent图解/02-订阅直通/】

【必须遵守】
1. 先完整读完 skill 目录下的 SKILL.md，再按里面的顺序读 references/ 和 examples/01-双层架构/。没读完不准动手。
2. 严格按 SKILL.md 的第 0–6 步执行，不跳步、不合并步骤。先写 storyboard.md（每个事实都标原文行号），再写 index.html。
3. index.html 必须从 assets/template.html 复制，只改标了【改这里】的区域；需要新元件时，只能在 <style> 末尾的"本图解专用"区追加，并且只用已有的颜色 token。
4. 运行 `bash <skill目录>/scripts/check.sh <输出目录>`，必须退出码为 0。失败就修，修完从头重跑整个脚本。不准改 check.sh、audit.mjs 或任何 references 文件来让检查通过。
5. 脚本通过后，必须用看图工具实际打开 _review/ 下的三类图片（contact-sheet*.jpg、gif-sheet.png、phone-sheet.png），按 references/review-checklist.md 逐条判定，写 REVIEW.md。判定只有 ✓ 和 ✗，拿不准就判 ✗ 再去修。最多 3 轮。
6. 不准编造原文里没有的数字和结论；示意用的编号要在 storyboard.md 里注明。
7. 没跑过的检查不准说跑过；没打开过的图不准说看过。

【交付时向我报告】
- GIF 路径、体积、帧数、时长；MP4 路径
- 每个场景一句话说明
- check.sh 最后一次运行的结尾输出（原样粘贴）
- REVIEW.md 里所有"有意为之的例外"及理由
- 没验证的事项
```

---

## 常见情况

- **还没定做哪几张图**：把"本次图解"那一行换成"请先按 SKILL.md 第 1 步给出选点清单，等我确认后再做"。
- **对方 Agent 不能看图**（没有图片读取能力）：第 5 步做不了。让它在报告里明确写"未做人工复核"，你自己打开 `_review/` 的三张图，对照 `references/review-checklist.md` 过一遍。
- **对方报告"通过"，但你想抽查**：在输出目录重跑一次 `bash <skill目录>/scripts/check.sh <输出目录>`，看结尾是不是"✓ 自动检查全部通过"，再打开 `_review/phone-sheet.png` 看一眼。
- **环境依赖**：Node ≥ 18、ffmpeg、能联网（首次运行 `npx -y hyperframes@0.8.226` 会下载渲染器和 Chromium）。
