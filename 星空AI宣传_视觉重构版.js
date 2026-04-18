const PptxGenJS = require("pptxgenjs");

let pptx = new PptxGenJS();

// 设置PPT尺寸为16:9
pptx.layout = "LAYOUT_16x9";
pptx.author = "星空AI";
pptx.title = "星空AI - 下一代AI API网关";

// ==================== 全新视觉设计系统 ====================
// 主题: 深邃星空 × 黑洞引力 × 玻璃拟态
const V = {
  // 色彩系统 - 深空渐变 + 星云辉光
  c: {
    // 背景层级
    void:        "050510",   // 虚空黑 - 最深层宇宙
    abyss:       "0a0b1e",   // 深渊蓝黑
    cosmos:      "0d1025",   // 宇宙深蓝
    nebula:      "1a1040",   // 星云暗紫
    darkMatter:  "0f0a2a",   // 暗物质紫

    // 辉光色 - 吸积盘光谱
    accretionGold:   "ffb347",  // 吸积盘金 - 最内环
    accretionOrange: "ff6b35",  // 吸积盘橙
    accretionRed:    "ff2d55",  // 吸积盘红
    eventHorizon:    "6c3bf7",  // 事件视界紫

    // 星光色
    starCore:    "ffffff",   // 恒星核心白
    starBlue:    "6dc8ff",   // 蓝巨星
    starCyan:    "00e5ff",   // 青色脉冲星
    starGold:    "ffd866",   // 金色超新星

    // UI 组件色
    glass:       "1a1a3a",   // 玻璃拟态基色
    glassBorder: "3a3a6a",   // 玻璃边框
    glassLight:  "2a2a5a",   // 玻璃高光
    textPrimary: "e8eaf6",   // 主文字
    textSecond:  "8b8fad",   // 次文字
    textMuted:   "5c5f7e",   // 暗淡文字
  },

  // 字体系统
  f: {
    display: "Microsoft YaHei",  // 展示字体
    body:    "Microsoft YaHei",  // 正文字体
    mono:    "Consolas",         // 等宽字体
    en:      "Segoe UI",         // 英文字体
  },

  // 页面尺寸
  page: { w: 10, h: 5.625 },
};

console.log("🌌 深空视觉系统 V2.0 已加载");

// ==================== 工具函数 ====================

// 生成星空粒子场
function addStarfield(slide, count, opts = {}) {
  const { avoidCenter = null, avoidRadius = 0, seed = 42 } = opts;
  // 使用确定性的伪随机，确保可重现
  let rng = seed;
  const rand = () => { rng = (rng * 16807 + 0) % 2147483647; return rng / 2147483647; };

  for (let i = 0; i < count; i++) {
    const x = rand() * V.page.w;
    const y = rand() * V.page.h;

    if (avoidCenter) {
      const dist = Math.sqrt(Math.pow(x - avoidCenter.x, 2) + Math.pow(y - avoidCenter.y, 2));
      if (dist < avoidRadius) continue;
    }

    const size = 0.01 + rand() * 0.04;
    const transparency = 30 + rand() * 55;
    const colors = [V.c.starCore, V.c.starBlue, V.c.starCyan, V.c.starGold];
    const color = rand() > 0.7 ? colors[Math.floor(rand() * colors.length)] : V.c.starCore;

    slide.addShape(pptx.ShapeType.ellipse, {
      x, y, w: size, h: size,
      fill: { type: "solid", color, transparency },
      line: { type: "none" }
    });
  }
}

// 绘制黑洞吸积盘效果
function addBlackHole(slide, cx, cy, scale = 1.0) {
  // 外层吸积盘辉光 - 多层椭圆模拟扭曲光环
  const diskLayers = [
    { rx: 3.2 * scale, ry: 1.2 * scale, color: V.c.eventHorizon, t: 85, w: 6 },
    { rx: 2.8 * scale, ry: 1.0 * scale, color: V.c.accretionRed, t: 78, w: 5 },
    { rx: 2.4 * scale, ry: 0.85 * scale, color: V.c.accretionOrange, t: 65, w: 8 },
    { rx: 2.0 * scale, ry: 0.7 * scale, color: V.c.accretionGold, t: 55, w: 10 },
    { rx: 1.7 * scale, ry: 0.6 * scale, color: V.c.accretionGold, t: 45, w: 6 },
  ];

  diskLayers.forEach(d => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - d.rx, y: cy - d.ry,
      w: d.rx * 2, h: d.ry * 2,
      fill: { type: "none" },
      line: { color: d.color, width: d.w, transparency: d.t }
    });
  });

  // 黑洞核心 - 事件视界（逐层加深的球体）
  const coreLayers = [
    { r: 1.2 * scale, color: V.c.darkMatter, t: 40 },
    { r: 0.9 * scale, color: V.c.nebula, t: 30 },
    { r: 0.6 * scale, color: "0a0520", t: 15 },
    { r: 0.35 * scale, color: "030210", t: 0 },
  ];

  coreLayers.forEach(c => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - c.r, y: cy - c.r,
      w: c.r * 2, h: c.r * 2,
      fill: { type: "solid", color: c.color, transparency: c.t },
      line: { type: "none" }
    });
  });

  // 光子球 - 黑洞边缘的明亮光环
  slide.addShape(pptx.ShapeType.ellipse, {
    x: cx - 0.45 * scale, y: cy - 0.45 * scale,
    w: 0.9 * scale, h: 0.9 * scale,
    fill: { type: "none" },
    line: { color: V.c.accretionGold, width: 2, transparency: 40 }
  });
}

// 绘制玻璃拟态面板
function addGlassPanel(slide, x, y, w, h, opts = {}) {
  const {
    borderColor = V.c.glassBorder,
    borderWidth = 1,
    glowColor = null,
    glowSize = 0.08,
    cornerRadius = 0.1
  } = opts;

  // 外层辉光（可选）
  if (glowColor) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x - glowSize, y: y - glowSize,
      w: w + glowSize * 2, h: h + glowSize * 2,
      fill: { type: "solid", color: glowColor, transparency: 85 },
      line: { type: "none" },
      rectRadius: cornerRadius + 0.02
    });
  }

  // 玻璃面板本体
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { type: "solid", color: V.c.glass, transparency: 15 },
    line: { color: borderColor, width: borderWidth, transparency: 40 },
    rectRadius: cornerRadius
  });

  // 顶部高光条（模拟光线折射）
  slide.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.15, y: y + 0.03,
    w: w * 0.4, h: 0.025,
    fill: { type: "solid", color: V.c.starCore, transparency: 85 },
    line: { type: "none" },
    rectRadius: 0.02
  });
}

// 绘制引力波纹
function addGravityWaves(slide, cx, cy, count = 5, maxRadius = 3) {
  for (let i = 0; i < count; i++) {
    const r = (maxRadius / count) * (i + 1);
    const transparency = 80 + (i * 3);
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - r, y: cy - r,
      w: r * 2, h: r * 2,
      fill: { type: "none" },
      line: { color: V.c.eventHorizon, width: 1, transparency, dashType: "dash" }
    });
  }
}

// 绘制流星
function addMeteors(slide, count = 3) {
  const meteors = [
    { x: 1.5, y: 0.3, w: 1.8, angle: 15 },
    { x: 6.2, y: 0.8, w: 1.2, angle: 20 },
    { x: 8.5, y: 1.5, w: 0.8, angle: 12 },
    { x: 3.0, y: 4.5, w: 1.0, angle: -10 },
    { x: 7.8, y: 3.8, w: 0.6, angle: 18 },
  ];

  for (let i = 0; i < Math.min(count, meteors.length); i++) {
    const m = meteors[i];
    // 流星尾迹（渐变线条）
    slide.addShape(pptx.ShapeType.line, {
      x: m.x, y: m.y,
      w: m.w, h: m.w * Math.tan(m.angle * Math.PI / 180),
      line: { color: V.c.starCore, width: 2, transparency: 50 }
    });
    // 流星头部亮点
    slide.addShape(pptx.ShapeType.ellipse, {
      x: m.x + m.w - 0.04, y: m.y + m.w * Math.tan(m.angle * Math.PI / 180) - 0.04,
      w: 0.08, h: 0.08,
      fill: { type: "solid", color: V.c.starCore, transparency: 20 },
      line: { type: "none" }
    });
  }
}

// 科技网格背景
function addTechGrid(slide, opts = {}) {
  const { transparency = 92, color = V.c.nebula, spacing = 0.5 } = opts;
  // 竖线
  for (let i = 0; i <= V.page.w / spacing; i++) {
    slide.addShape(pptx.ShapeType.line, {
      x: i * spacing, y: 0, w: 0, h: V.page.h,
      line: { color, width: 0.5, transparency }
    });
  }
  // 横线
  for (let i = 0; i <= V.page.h / spacing; i++) {
    slide.addShape(pptx.ShapeType.line, {
      x: 0, y: i * spacing, w: V.page.w, h: 0,
      line: { color, width: 0.5, transparency }
    });
  }
}


// ==================== 第1页：封面页 - 黑洞降临 ====================
let slide1 = pptx.addSlide();
slide1.background = { fill: V.c.void };

// 星空背景粒子
addStarfield(slide1, 120, { avoidCenter: { x: 7.0, y: 2.5 }, avoidRadius: 1.8, seed: 314 });

// 流星划过
addMeteors(slide1, 3);

// 黑洞 - 页面右上区域，视觉焦点
addBlackHole(slide1, 7.5, 2.2, 1.1);

// 底部星云带 - 横贯底部的星云色彩
slide1.addShape(pptx.ShapeType.ellipse, {
  x: -2, y: 4.0, w: 14, h: 3.2,
  fill: { type: "solid", color: V.c.nebula, transparency: 75 },
  line: { type: "none" }
});
slide1.addShape(pptx.ShapeType.ellipse, {
  x: -1, y: 4.5, w: 12, h: 2.5,
  fill: { type: "solid", color: V.c.eventHorizon, transparency: 88 },
  line: { type: "none" }
});

// 左侧科技竖线装饰
slide1.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 1.5, w: 0.06, h: 2.8,
  fill: { type: "solid", color: V.c.starCyan },
  line: { type: "none" }
});
// 科技横线 - 层叠
[
  { y: 1.5, w: 2.2, t: 0 },
  { y: 1.85, w: 1.6, t: 30 },
  { y: 2.15, w: 1.0, t: 50 },
  { y: 4.3, w: 1.8, t: 20 },
].forEach(l => {
  slide1.addShape(pptx.ShapeType.line, {
    x: 0.6, y: l.y, w: l.w, h: 0,
    line: { color: V.c.starCyan, width: 2, transparency: l.t }
  });
});

// 纳米粒子装饰 - 左侧科技线条末端的发光点
[
  { x: 2.8, y: 1.5, s: 0.06 },
  { x: 2.2, y: 1.85, s: 0.05 },
  { x: 1.6, y: 2.15, s: 0.04 },
].forEach(p => {
  slide1.addShape(pptx.ShapeType.ellipse, {
    x: p.x, y: p.y - p.s / 2, w: p.s, h: p.s,
    fill: { type: "solid", color: V.c.starCyan },
    line: { type: "none" }
  });
});

// ===== 主标题 =====
slide1.addText("星空AI", {
  x: 0.75, y: 2.3, w: 5.5, h: 1.1,
  fontSize: 92,
  bold: true,
  color: V.c.starCore,
  fontFace: V.f.display,
  align: "left",
  shadow: {
    type: "outer", color: V.c.starCyan,
    blur: 12, offset: 0, angle: 0, opacity: 0.4
  }
});

// 副标题 - 吸积盘金色
slide1.addText("卷爆所有中转站的星空AI来了！", {
  x: 0.75, y: 3.5, w: 5.5, h: 0.5,
  fontSize: 26,
  bold: true,
  color: V.c.accretionGold,
  fontFace: V.f.display,
  align: "left",
  glow: { size: 6, color: V.c.accretionGold, opacity: 0.3 }
});

// 英文标签 - 等宽科技感
slide1.addText("NEXT-GENERATION  AI  API  GATEWAY", {
  x: 0.75, y: 4.1, w: 5.5, h: 0.3,
  fontSize: 12,
  color: V.c.textSecond,
  fontFace: V.f.mono,
  align: "left",
  charSpacing: 3
});

// 底部金色分割线
slide1.addShape(pptx.ShapeType.rect, {
  x: 0.75, y: 4.55, w: 4.0, h: 0.025,
  fill: { type: "solid", color: V.c.accretionGold, transparency: 30 },
  line: { type: "none" }
});
slide1.addShape(pptx.ShapeType.rect, {
  x: 4.9, y: 4.55, w: 0.8, h: 0.025,
  fill: { type: "solid", color: V.c.starCyan, transparency: 50 },
  line: { type: "none" }
});

console.log("✅ 第1页（封面 - 黑洞降临）已创建");


// ==================== 第2页：AI模型矩阵 - 玻璃拟态 ====================
let slide2 = pptx.addSlide();
slide2.background = { fill: V.c.void };

// 科技网格背景
addTechGrid(slide2, { transparency: 93, spacing: 0.6 });

// 星空粒子（稀疏）
addStarfield(slide2, 50, { seed: 628 });

// 右上角小型黑洞装饰
addBlackHole(slide2, 9.2, 0.5, 0.3);

// 页面标题
slide2.addText("AI 模型矩阵", {
  x: 0.5, y: 0.2, w: 8, h: 0.65,
  fontSize: 44,
  bold: true,
  color: V.c.starCore,
  fontFace: V.f.display,
  align: "left",
  shadow: { type: "outer", color: V.c.eventHorizon, blur: 8, offset: 0, angle: 0, opacity: 0.3 }
});

// 标题下方装饰线
slide2.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.88, w: 2.8, h: 0.04,
  fill: { type: "solid", color: V.c.accretionGold },
  line: { type: "none" }
});
slide2.addShape(pptx.ShapeType.rect, {
  x: 3.4, y: 0.88, w: 1.2, h: 0.04,
  fill: { type: "solid", color: V.c.starCyan, transparency: 40 },
  line: { type: "none" }
});

// 模型数据
const models = [
  { name: "claude-haiku-4.5",           input: "$1.0000",  output: "$5.0000",   brand: "Anthropic" },
  { name: "claude-haiku-4.5-thinking",  input: "$1.5000",  output: "$7.5000",   brand: "Anthropic" },
  { name: "claude-sonnet-4",            input: "$2.0000",  output: "$10.0000",  brand: "Anthropic" },
  { name: "claude-sonnet-4.5",          input: "$2.5000",  output: "$12.5000",  brand: "Anthropic" },
  { name: "claude-sonnet-4.5-thinking", input: "$3.7500",  output: "$18.7500",  brand: "Anthropic" },
  { name: "deepseek-3.2-thinking",      input: "$2.5000",  output: "$12.5000",  brand: "DeepSeek" },
  { name: "glm-5-thinking",             input: "$5.0000",  output: "$25.0000",  brand: "Zhipu AI" },
  { name: "minimax-m2.5-thinking",      input: "$2.5000",  output: "$12.5000",  brand: "MiniMax" },
  { name: "qwen3-coder-next-thinking",  input: "$2.5000",  output: "$12.5000",  brand: "Alibaba" },
];

// 模型卡片颜色主题
const cardThemes = [
  { accent: "00ff88", glow: "00ff88" },  // 翠绿
  { accent: "00e5ff", glow: "00e5ff" },  // 青蓝
  { accent: "6dc8ff", glow: "6dc8ff" },  // 天蓝
  { accent: "a78bfa", glow: "a78bfa" },  // 薰衣草
  { accent: "ffd866", glow: "ffd866" },  // 暖金
  { accent: "4ecdc4", glow: "4ecdc4" },  // 薄荷
  { accent: "ff6b6b", glow: "ff6b6b" },  // 珊瑚
  { accent: "c084fc", glow: "c084fc" },  // 紫罗兰
  { accent: "fb923c", glow: "fb923c" },  // 琥珀
];

// 卡片布局 - 3列 × 3行
const cardW = 2.9;
const cardH = 0.72;
const cardGapX = 0.15;
const cardGapY = 0.12;
const gridStartX = 0.5;
const gridStartY = 1.05;

models.forEach((model, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = gridStartX + col * (cardW + cardGapX);
  const y = gridStartY + row * (cardH + cardGapY);
  const theme = cardThemes[i];

  // 玻璃拟态卡片
  addGlassPanel(slide2, x, y, cardW, cardH, {
    borderColor: theme.accent,
    borderWidth: 1,
    glowColor: theme.glow,
    glowSize: 0.04,
    cornerRadius: 0.08
  });

  // 左侧发光指示条
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.06, y: y + 0.1,
    w: 0.05, h: cardH - 0.2,
    fill: { type: "solid", color: theme.accent },
    line: { type: "none" },
    rectRadius: 0.025
  });

  // 模型名称
  slide2.addText(model.name, {
    x: x + 0.2, y: y + 0.08,
    w: cardW - 0.3, h: 0.24,
    fontSize: 11.5,
    bold: true,
    color: V.c.starCore,
    fontFace: V.f.mono,
    align: "left", valign: "middle"
  });

  // 品牌标签
  slide2.addText(model.brand, {
    x: x + cardW - 1.0, y: y + 0.08,
    w: 0.9, h: 0.22,
    fontSize: 8,
    color: theme.accent,
    fontFace: V.f.en,
    align: "right", valign: "middle"
  });

  // 输入价格
  slide2.addText(`输入  ${model.input}`, {
    x: x + 0.2, y: y + 0.35,
    w: 1.3, h: 0.15,
    fontSize: 9,
    color: V.c.textSecond,
    fontFace: V.f.mono,
    align: "left", valign: "middle"
  });

  // 补全价格
  slide2.addText(`补全  ${model.output}`, {
    x: x + 1.5, y: y + 0.35,
    w: 1.3, h: 0.15,
    fontSize: 9,
    color: V.c.textSecond,
    fontFace: V.f.mono,
    align: "left", valign: "middle"
  });

  // 单位
  slide2.addText("/ 1M Tokens", {
    x: x + 0.2, y: y + 0.52,
    w: cardW - 0.3, h: 0.14,
    fontSize: 8,
    italic: true,
    color: V.c.textMuted,
    fontFace: V.f.en,
    align: "left", valign: "middle"
  });
});

// ===== 底部价格优势区域 - 玻璃拟态大面板 =====
const priceY = 3.7;
const priceH = 1.0;

addGlassPanel(slide2, 0.5, priceY, 9.0, priceH, {
  borderColor: V.c.accretionGold,
  borderWidth: 2,
  glowColor: V.c.accretionGold,
  glowSize: 0.06,
  cornerRadius: 0.12
});

// 价格标题
slide2.addText("超值定价", {
  x: 0.7, y: priceY + 0.08,
  w: 3, h: 0.3,
  fontSize: 22,
  bold: true,
  color: V.c.accretionGold,
  fontFace: V.f.display,
  align: "left", valign: "middle"
});

// ¥1 = $100 大字
slide2.addText([
  { text: "¥1", options: { fontSize: 48, bold: true, color: V.c.accretionGold, fontFace: V.f.mono } },
  { text: "  =  ", options: { fontSize: 32, bold: true, color: V.c.textPrimary, fontFace: V.f.mono } },
  { text: "$100", options: { fontSize: 48, bold: true, color: V.c.accretionGold, fontFace: V.f.mono } },
], {
  x: 0.7, y: priceY + 0.35,
  w: 4.5, h: 0.6,
  align: "left", valign: "middle"
});

// 说明文字
slide2.addText("≈ 1500次 claude-sonnet-4.5-thinking 请求 ≈ 2000W token", {
  x: 5.2, y: priceY + 0.4,
  w: 4.0, h: 0.25,
  fontSize: 13,
  color: V.c.textPrimary,
  fontFace: V.f.body,
  align: "left", valign: "middle"
});

// 底部小字
slide2.addText("按量计费  ·  用多少付多少  ·  无月费门槛", {
  x: 5.2, y: priceY + 0.68,
  w: 4.0, h: 0.2,
  fontSize: 10,
  color: V.c.textMuted,
  fontFace: V.f.body,
  align: "left", valign: "middle"
});

// 底部模型数量标注
slide2.addText("更多模型持续接入中...", {
  x: 0.5, y: 4.85,
  w: 9.0, h: 0.25,
  fontSize: 11,
  italic: true,
  color: V.c.textMuted,
  fontFace: V.f.body,
  align: "center", valign: "middle"
});

console.log("✅ 第2页（AI模型矩阵 - 玻璃拟态）已创建");


// ==================== 第3页：立即启航 - 核心优势 ====================
let slide3 = pptx.addSlide();
slide3.background = { fill: V.c.void };

// 星空 + 流星
addStarfield(slide3, 80, { seed: 271 });
addMeteors(slide3, 2);

// 引力波纹装饰（背景）
addGravityWaves(slide3, 5.0, 2.8, 4, 4.0);

// 页面标题
slide3.addText("立即启航", {
  x: 0.5, y: 0.2, w: 9, h: 0.6,
  fontSize: 44,
  bold: true,
  color: V.c.starCore,
  fontFace: V.f.display,
  align: "center",
  shadow: { type: "outer", color: V.c.eventHorizon, blur: 10, offset: 0, angle: 0, opacity: 0.3 }
});

// 标题下方居中装饰
slide3.addShape(pptx.ShapeType.rect, {
  x: 3.8, y: 0.85, w: 2.4, h: 0.04,
  fill: { type: "solid", color: V.c.starCyan },
  line: { type: "none" }
});

// ===== 访问地址大卡片 =====
const urlY = 1.1;
addGlassPanel(slide3, 0.5, urlY, 9.0, 1.2, {
  borderColor: V.c.starCyan,
  borderWidth: 2,
  glowColor: V.c.starCyan,
  glowSize: 0.06,
  cornerRadius: 0.12
});

// 地球图标
slide3.addText("🌐", {
  x: 0.7, y: urlY + 0.15, w: 0.8, h: 0.8,
  fontSize: 52, align: "center", valign: "middle"
});

// 站点名称
slide3.addText("星空AI中转站", {
  x: 1.6, y: urlY + 0.15, w: 7.5, h: 0.4,
  fontSize: 26, bold: true,
  color: V.c.starCyan,
  fontFace: V.f.display,
  align: "left", valign: "middle"
});

// URL
slide3.addText("xingkongai.zeabur.app", {
  x: 1.6, y: urlY + 0.6, w: 7.5, h: 0.45,
  fontSize: 30, bold: true,
  color: V.c.accretionGold,
  fontFace: V.f.mono,
  align: "left", valign: "middle",
  hyperlink: { url: "https://xingkongai.zeabur.app" }
});

// ===== 核心优势标题 =====
slide3.addText("核心优势", {
  x: 0.5, y: 2.5, w: 9, h: 0.4,
  fontSize: 28, bold: true,
  color: V.c.starCore,
  fontFace: V.f.display,
  align: "center", valign: "middle"
});

// ===== 三大优势卡片 =====
const advData = [
  { icon: "⚡", title: "支持高并发", desc: "无请求限制\n轻松应对大规模调用", accent: "00ff88" },
  { icon: "🚀", title: "请求速度极快", desc: "毫秒级响应\n极致性能体验", accent: "00e5ff" },
  { icon: "🌏", title: "国内无须魔法", desc: "直连访问\n稳定可靠", accent: "fb923c" },
];

const advW = 2.85;
const advH = 2.0;
const advGap = 0.15;
const advStartY = 3.05;

advData.forEach((adv, i) => {
  const x = 0.5 + i * (advW + advGap);

  // 玻璃卡片
  addGlassPanel(slide3, x, advStartY, advW, advH, {
    borderColor: adv.accent,
    glowColor: adv.accent,
    glowSize: 0.04,
    cornerRadius: 0.1
  });

  // 顶部发光条
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.3, y: advStartY + 0.02,
    w: advW - 0.6, h: 0.05,
    fill: { type: "solid", color: adv.accent, transparency: 40 },
    line: { type: "none" },
    rectRadius: 0.025
  });

  // 图标背景光晕
  slide3.addShape(pptx.ShapeType.ellipse, {
    x: x + (advW - 0.9) / 2, y: advStartY + 0.2,
    w: 0.9, h: 0.9,
    fill: { type: "solid", color: adv.accent, transparency: 85 },
    line: { type: "none" }
  });

  // 图标
  slide3.addText(adv.icon, {
    x: x, y: advStartY + 0.2,
    w: advW, h: 0.9,
    fontSize: 52, align: "center", valign: "middle"
  });

  // 标题
  slide3.addText(adv.title, {
    x: x + 0.1, y: advStartY + 1.2,
    w: advW - 0.2, h: 0.35,
    fontSize: 20, bold: true,
    color: adv.accent,
    fontFace: V.f.display,
    align: "center", valign: "middle"
  });

  // 描述
  slide3.addText(adv.desc, {
    x: x + 0.1, y: advStartY + 1.55,
    w: advW - 0.2, h: 0.35,
    fontSize: 12,
    color: V.c.textSecond,
    fontFace: V.f.body,
    align: "center", valign: "top",
    lineSpacingMultiple: 1.3
  });
});

console.log("✅ 第3页（立即启航 - 核心优势）已创建");


// ==================== 第4页：快速接入 - 太空舱步骤流程 ====================
let slide4 = pptx.addSlide();
slide4.background = { fill: V.c.void };

// 稀疏星空
addStarfield(slide4, 40, { seed: 159 });

// 科技网格（更疏）
addTechGrid(slide4, { transparency: 95, spacing: 0.8, color: V.c.cosmos });

// 页面标题
slide4.addText("快速接入", {
  x: 0.5, y: 0.2, w: 8, h: 0.6,
  fontSize: 44,
  bold: true,
  color: V.c.starCore,
  fontFace: V.f.display,
  align: "left",
  shadow: { type: "outer", color: V.c.starCyan, blur: 8, offset: 0, angle: 0, opacity: 0.25 }
});

// 标题装饰线
slide4.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.85, w: 2.5, h: 0.04,
  fill: { type: "solid", color: V.c.starCyan },
  line: { type: "none" }
});

// 步骤数据
const steps = [
  { num: "01", title: "注册账号",     desc: "赠送 10$",                         icon: "👤", color: "00ff88" },
  { num: "02", title: "获取令牌",     desc: "生成 API Token",                   icon: "🔑", color: "00e5ff" },
  { num: "03", title: "配置请求地址", desc: "xingkongai.zeabur.app",            icon: "🌐", color: "6dc8ff" },
  { num: "04", title: "配置令牌",     desc: "填入获取到的令牌",                 icon: "⚙️", color: "a78bfa" },
  { num: "05", title: "配置API格式",  desc: "Anthropic / OpenAI",               icon: "📋", color: "ffd866" },
  { num: "06", title: "完美应用",     desc: "Claude Code / Kilo / OpenCode",    icon: "✨", color: "ff6b9d" },
];

const stepW = 4.35;
const stepH = 0.68;
const stepGapX = 0.2;
const stepGapY = 0.14;
const stepStartY = 1.1;

steps.forEach((step, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.5 + col * (stepW + stepGapX);
  const y = stepStartY + row * (stepH + stepGapY);

  // 玻璃卡片
  addGlassPanel(slide4, x, y, stepW, stepH, {
    borderColor: step.color,
    glowColor: step.color,
    glowSize: 0.03,
    cornerRadius: 0.08
  });

  // 编号区域 - 发光编号块
  slide4.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.06, y: y + 0.06,
    w: 0.56, h: stepH - 0.12,
    fill: { type: "solid", color: step.color, transparency: 15 },
    line: { type: "none" },
    rectRadius: 0.06
  });

  // 编号文字
  slide4.addText(step.num, {
    x: x + 0.06, y: y + 0.06,
    w: 0.56, h: stepH - 0.12,
    fontSize: 22, bold: true,
    color: V.c.void,
    fontFace: V.f.mono,
    align: "center", valign: "middle"
  });

  // 图标
  slide4.addText(step.icon, {
    x: x + 0.7, y: y + 0.08,
    w: 0.5, h: 0.5,
    fontSize: 30, align: "center", valign: "middle"
  });

  // 标题
  slide4.addText(step.title, {
    x: x + 1.25, y: y + 0.1,
    w: stepW - 1.4, h: 0.25,
    fontSize: 17, bold: true,
    color: V.c.starCore,
    fontFace: V.f.display,
    align: "left", valign: "middle"
  });

  // 描述
  slide4.addText(step.desc, {
    x: x + 1.25, y: y + 0.38,
    w: stepW - 1.4, h: 0.2,
    fontSize: 12,
    color: V.c.textSecond,
    fontFace: V.f.body,
    align: "left", valign: "middle"
  });

  // 连接线（同行箭头）
  if (col === 0 && i < steps.length - 1) {
    slide4.addShape(pptx.ShapeType.line, {
      x: x + stepW + 0.03, y: y + stepH / 2,
      w: stepGapX - 0.06, h: 0,
      line: { color: step.color, width: 2, transparency: 50 }
    });
    // 箭头头部
    slide4.addShape(pptx.ShapeType.ellipse, {
      x: x + stepW + stepGapX - 0.06, y: y + stepH / 2 - 0.03,
      w: 0.06, h: 0.06,
      fill: { type: "solid", color: step.color, transparency: 30 },
      line: { type: "none" }
    });
  }
});

// 底部提示卡片
const tipY = stepStartY + 3 * (stepH + stepGapY) + 0.08;

addGlassPanel(slide4, 0.5, tipY, 9.0, 0.65, {
  borderColor: V.c.accretionGold,
  borderWidth: 2,
  glowColor: V.c.accretionGold,
  glowSize: 0.04,
  cornerRadius: 0.1
});

slide4.addText("💡", {
  x: 0.7, y: tipY + 0.08, w: 0.5, h: 0.5,
  fontSize: 32, align: "center", valign: "middle"
});

slide4.addText("新用户注册即送 10$ 额度，立即开始体验！", {
  x: 1.3, y: tipY + 0.12, w: 7.8, h: 0.4,
  fontSize: 20, bold: true,
  color: V.c.accretionGold,
  fontFace: V.f.display,
  align: "left", valign: "middle"
});

console.log("✅ 第4页（快速接入 - 太空舱流程）已创建");


// ==================== 第5页：全程护航 - 引力波纹 ====================
let slide5 = pptx.addSlide();
slide5.background = { fill: V.c.void };

// 引力波纹背景 - 从中心扩散
addGravityWaves(slide5, 5.0, 2.8, 8, 4.5);

// 星空
addStarfield(slide5, 60, { seed: 732 });

// 页面标题
slide5.addText("全程护航", {
  x: 0.5, y: 0.2, w: 9, h: 0.6,
  fontSize: 44,
  bold: true,
  color: V.c.starCore,
  fontFace: V.f.display,
  align: "center",
  shadow: { type: "outer", color: V.c.eventHorizon, blur: 10, offset: 0, angle: 0, opacity: 0.3 }
});

// 标题装饰
slide5.addShape(pptx.ShapeType.rect, {
  x: 3.8, y: 0.85, w: 2.4, h: 0.04,
  fill: { type: "solid", color: V.c.starCyan },
  line: { type: "none" }
});

// ===== 中心服务承诺大卡片 =====
const svcY = 1.1;
const svcW = 8.0;
const svcH = 1.5;

addGlassPanel(slide5, (10 - svcW) / 2, svcY, svcW, svcH, {
  borderColor: V.c.starCyan,
  borderWidth: 2,
  glowColor: V.c.starCyan,
  glowSize: 0.06,
  cornerRadius: 0.12
});

// 盾牌图标
slide5.addText("🛡️", {
  x: (10 - svcW) / 2, y: svcY + 0.1,
  w: svcW, h: 0.65,
  fontSize: 56, align: "center", valign: "middle"
});

// 服务标题
slide5.addText("完整的售后服务", {
  x: (10 - svcW) / 2, y: svcY + 0.8,
  w: svcW, h: 0.35,
  fontSize: 28, bold: true,
  color: V.c.starCyan,
  fontFace: V.f.display,
  align: "center", valign: "middle"
});

// 说明文字
slide5.addText("专业团队 · 全天候响应 · 持续迭代", {
  x: (10 - svcW) / 2, y: svcY + 1.15,
  w: svcW, h: 0.25,
  fontSize: 13,
  color: V.c.textSecond,
  fontFace: V.f.body,
  align: "center", valign: "middle"
});

// ===== QQ群大卡片 =====
const qqY = 2.85;
const qqW = 6.5;
const qqH = 1.8;

addGlassPanel(slide5, (10 - qqW) / 2, qqY, qqW, qqH, {
  borderColor: V.c.accretionGold,
  borderWidth: 2,
  glowColor: V.c.accretionGold,
  glowSize: 0.06,
  cornerRadius: 0.12
});

// QQ群顶部金色发光条
slide5.addShape(pptx.ShapeType.roundRect, {
  x: (10 - qqW) / 2 + 0.5, y: qqY + 0.03,
  w: qqW - 1.0, h: 0.06,
  fill: { type: "solid", color: V.c.accretionGold, transparency: 40 },
  line: { type: "none" },
  rectRadius: 0.03
});

// 聊天图标
slide5.addText("💬", {
  x: (10 - qqW) / 2, y: qqY + 0.2,
  w: qqW, h: 0.55,
  fontSize: 48, align: "center", valign: "middle"
});

// QQ文字
slide5.addText("加入技术支持QQ群", {
  x: (10 - qqW) / 2, y: qqY + 0.8,
  w: qqW, h: 0.35,
  fontSize: 24, bold: true,
  color: V.c.textPrimary,
  fontFace: V.f.display,
  align: "center", valign: "middle"
});

// QQ群号 - 超大金色
slide5.addText("978772109", {
  x: (10 - qqW) / 2, y: qqY + 1.2,
  w: qqW, h: 0.5,
  fontSize: 44, bold: true,
  color: V.c.accretionGold,
  fontFace: V.f.mono,
  align: "center", valign: "middle",
  glow: { size: 4, color: V.c.accretionGold, opacity: 0.2 }
});

// 底部服务承诺
slide5.addText("7×24 小时技术支持  ·  随时为您解答疑问", {
  x: 1.0, y: 5.0, w: 8.0, h: 0.35,
  fontSize: 14,
  color: V.c.textMuted,
  fontFace: V.f.body,
  align: "center", valign: "middle"
});

console.log("✅ 第5页（全程护航 - 引力波纹）已创建");


// ==================== 保存PPT ====================
pptx.writeFile({ fileName: "星空AI宣传PPT_视觉重构版.pptx" })
  .then(() => {
    console.log("\n🎉 PPT生成成功：星空AI宣传PPT_视觉重构版.pptx");
    console.log("\n✨ 视觉重构完成：");
    console.log("   🌌 深邃虚空黑底色 + 星空粒子场");
    console.log("   🕳️ 黑洞吸积盘光谱（金/橙/红/紫渐变）");
    console.log("   💎 玻璃拟态面板 + 顶部光线折射高光");
    console.log("   🌠 流星划过 + 引力波纹扩散效果");
    console.log("   🎨 9色模型卡片矩阵 + 发光指示条");
    console.log("   🔮 事件视界紫 × 吸积盘金 主色调");
  })
  .catch((err) => {
    console.error("❌ 生成失败:", err);
  });
