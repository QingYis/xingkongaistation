const PptxGenJS = require("pptxgenjs");

let pptx = new PptxGenJS();

// 设置PPT尺寸为16:9
pptx.layout = "LAYOUT_16x9";
pptx.author = "星空AI";
pptx.title = "星空AI - 下一代AI API网关";

// ==================== 设计系统配置 ====================
const DESIGN = {
  // 深空渐变色系 - 从深紫到黑色的宇宙色调
  colors: {
    deepSpace: "0a0a1a",      // 最深的宇宙黑
    cosmicPurple: "1a1a3e",   // 宇宙紫
    nebulaPurple: "2d1b4e",   // 星云紫
    galaxyBlue: "0f1f3f",     // 星系蓝

    // 高亮色 - 星光与能量
    cyberCyan: "00f0ff",      // 赛博青
    electricBlue: "0099ff",   // 电光蓝
    plasmaGold: "ffd700",     // 等离子金
    starWhite: "ffffff",      // 星光白

    // 卡片与UI
    cardDark: "1a1a2e",       // 卡片深色
    cardMid: "252541",        // 卡片中色
    borderGlow: "00d4ff",     // 边框发光
    textMuted: "8892b0",      // 文字暗色
  },

  // 字体系统
  fonts: {
    title: "Microsoft YaHei",
    body: "Microsoft YaHei",
    mono: "Consolas",
    english: "Arial"
  },

  // 尺寸系统
  spacing: {
    page: { w: 10, h: 5.625 },
    margin: 0.5,
    gap: { sm: 0.15, md: 0.25, lg: 0.4 }
  }
};

console.log("🎨 设计系统已加载");

// ==================== 第1页：封面页 - 宇宙黑洞主题 ====================
let slide1 = pptx.addSlide();

// 深空渐变背景
slide1.background = { fill: DESIGN.colors.deepSpace };

// 创建黑洞视觉效果 - 多层同心圆模拟引力透镜
const blackHole = {
  centerX: 8.5,
  centerY: 2.8,
  layers: [
    { r: 2.2, color: DESIGN.colors.nebulaPurple, transparency: 70 },
    { r: 1.6, color: DESIGN.colors.cosmicPurple, transparency: 60 },
    { r: 1.1, color: DESIGN.colors.galaxyBlue, transparency: 50 },
    { r: 0.7, color: "1a0a3e", transparency: 40 },
    { r: 0.4, color: "0a0520", transparency: 20 }
  ]
};

blackHole.layers.forEach(layer => {
  slide1.addShape(pptx.ShapeType.ellipse, {
    x: blackHole.centerX - layer.r,
    y: blackHole.centerY - layer.r,
    w: layer.r * 2,
    h: layer.r * 2,
    fill: { type: "solid", color: layer.color, transparency: layer.transparency },
    line: { type: "none" }
  });
});

// 添加黑洞边缘的光环效果
slide1.addShape(pptx.ShapeType.ellipse, {
  x: blackHole.centerX - 2.5,
  y: blackHole.centerY - 2.5,
  w: 5.0,
  h: 5.0,
  fill: { type: "none" },
  line: { color: DESIGN.colors.cyberCyan, width: 2, transparency: 70 }
});

slide1.addShape(pptx.ShapeType.ellipse, {
  x: blackHole.centerX - 2.7,
  y: blackHole.centerY - 2.7,
  w: 5.4,
  h: 5.4,
  fill: { type: "none" },
  line: { color: DESIGN.colors.electricBlue, width: 1, transparency: 80 }
});

// 星空粒子系统 - 更多更密集的星点
for (let i = 0; i < 80; i++) {
  const x = Math.random() * 10;
  const y = Math.random() * 5.625;
  const size = 0.01 + Math.random() * 0.05;
  const brightness = 20 + Math.random() * 60;
  
  // 距离黑洞越近，星点越扭曲（模拟引力透镜）
  const distToBlackHole = Math.sqrt(
    Math.pow(x - blackHole.centerX, 2) + 
    Math.pow(y - blackHole.centerY, 2)
  );
  
  if (distToBlackHole > 1.5) { // 只在黑洞外围绘制星点
    slide1.addShape(pptx.ShapeType.ellipse, {
      x: x,
      y: y,
      w: size,
      h: size,
      fill: { type: "solid", color: DESIGN.colors.starWhite, transparency: brightness },
      line: { type: "none" }
    });
  }
}

// 左侧科技装饰框架
const techFrame = {
  x: 0.4,
  y: 1.8,
  w: 0.08,
  h: 2.2
};

slide1.addShape(pptx.ShapeType.rect, {
  x: techFrame.x,
  y: techFrame.y,
  w: techFrame.w,
  h: techFrame.h,
  fill: { type: "solid", color: DESIGN.colors.cyberCyan },
  line: { type: "none" }
});

// 科技线条装饰
const techLines = [
  { x: 0.55, y: 1.8, w: 1.8, transparency: 0 },
  { x: 0.55, y: 2.1, w: 1.4, transparency: 30 },
  { x: 0.55, y: 2.4, w: 1.0, transparency: 50 },
  { x: 0.55, y: 4.0, w: 1.6, transparency: 20 }
];

techLines.forEach(line => {
  slide1.addShape(pptx.ShapeType.line, {
    x: line.x,
    y: line.y,
    w: line.w,
    h: 0,
    line: { color: DESIGN.colors.cyberCyan, width: 2, transparency: line.transparency }
  });
});

// 主标题 - 超大字号，强烈视觉冲击
slide1.addText("星空AI", {
  x: 0.6,
  y: 2.2,
  w: 6.5,
  h: 1.0,
  fontSize: 88,
  bold: true,
  color: DESIGN.colors.starWhite,
  fontFace: DESIGN.fonts.title,
  align: "left",
  valign: "middle",
  shadow: {
    type: "outer",
    color: DESIGN.colors.cyberCyan,
    blur: 8,
    offset: 2,
    angle: 45,
    opacity: 0.6
  }
});

// 副标题 - 发光效果
slide1.addText("卷爆所有中转站的星空AI来了！", {
  x: 0.6,
  y: 3.3,
  w: 6.5,
  h: 0.5,
  fontSize: 28,
  bold: true,
  color: DESIGN.colors.cyberCyan,
  fontFace: DESIGN.fonts.title,
  align: "left",
  valign: "middle",
  glow: {
    size: 8,
    color: DESIGN.colors.cyberCyan,
    opacity: 0.5
  }
});

// 英文标签 - 等宽字体科技感
slide1.addText("NEXT-GENERATION AI API GATEWAY", {
  x: 0.6,
  y: 4.0,
  w: 6.5,
  h: 0.35,
  fontSize: 14,
  color: DESIGN.colors.textMuted,
  fontFace: DESIGN.fonts.mono,
  align: "left",
  italic: false,
  charSpacing: 2
});

// 底部装饰线
slide1.addShape(pptx.ShapeType.rect, {
  x: 0.6,
  y: 4.5,
  w: 3.5,
  h: 0.03,
  fill: { 
    type: "solid", 
    color: DESIGN.colors.plasmaGold,
    transparency: 30
  },
  line: { type: "none" }
});

console.log("✅ 第1页（封面页 - 宇宙黑洞主题）已创建");


// ==================== 第2页：支持的模型与价格 - 数据可视化风格 ====================
let slide2 = pptx.addSlide();

// 深空背景
slide2.background = { fill: DESIGN.colors.deepSpace };

// 背景装饰 - 网格线科技感
for (let i = 0; i < 20; i++) {
  const x = 0.5 + i * 0.5;
  slide2.addShape(pptx.ShapeType.line, {
    x: x,
    y: 0,
    w: 0,
    h: 5.625,
    line: { color: DESIGN.colors.cosmicPurple, width: 0.5, transparency: 90 }
  });
}

// 页面标题 - 大胆的排版
slide2.addText("AI 模型矩阵", {
  x: 0.5,
  y: 0.35,
  w: 9,
  h: 0.7,
  fontSize: 52,
  bold: true,
  color: DESIGN.colors.starWhite,
  fontFace: DESIGN.fonts.title,
  align: "left"
});

// 标题装饰 - 发光线条
slide2.addShape(pptx.ShapeType.rect, {
  x: 0.5,
  y: 1.1,
  w: 3.5,
  h: 0.05,
  fill: { type: "solid", color: DESIGN.colors.cyberCyan },
  line: { type: "none" }
});

slide2.addShape(pptx.ShapeType.rect, {
  x: 4.1,
  y: 1.1,
  w: 0.8,
  h: 0.05,
  fill: { type: "solid", color: DESIGN.colors.plasmaGold },
  line: { type: "none" }
});

// 模型数据
const models = [
  {
    name: "claude-haiku-4.5",
    input: "$1.0000",
    output: "$5.0000",
    tier: "轻量级"
  },
  {
    name: "claude-haiku-4.5-thinking",
    input: "$1.5000",
    output: "$7.5000",
    tier: "思考型"
  },
  {
    name: "claude-sonnet-4",
    input: "$2.0000",
    output: "$10.0000",
    tier: "标准版"
  },
  {
    name: "claude-sonnet-4.5",
    input: "$2.5000",
    output: "$12.5000",
    tier: "增强版"
  },
  {
    name: "claude-sonnet-4.5-thinking",
    input: "$3.7500",
    output: "$18.7500",
    tier: "旗舰版"
  },
  {
    name: "glm-5-thinking",
    input: "$5.0000",
    output: "$25.0000",
    tier: "思考型"
  },
  {
    name: "deepseek-3.2-thinking",
    input: "$2.5000",
    output: "$12.5000",
    tier: "思考型"
  },
  {
    name: "minimax-m2.5-thinking",
    input: "$2.5000",
    output: "$12.5000",
    tier: "思考型"
  },
  {
    name: "qwen3-coder-next-thinking",
    input: "$2.5000",
    output: "$12.5000",
    tier: "编程型"
  }
];

// 模型卡片 - 现代化设计（3列布局适配9个模型）
let startY = 1.25;
let cardWidth = 2.9;
let cardHeight = 0.55;
let gap = 0.12;

models.forEach((model, index) => {
  const col = index % 3;
  const row = Math.floor(index / 3);
  const x = 0.4 + col * (cardWidth + gap);
  const y = startY + row * (cardHeight + gap);

  // 卡片背景 - 渐变效果
  slide2.addShape(pptx.ShapeType.rect, {
    x: x,
    y: y,
    w: cardWidth,
    h: cardHeight,
    fill: { type: "solid", color: DESIGN.colors.cardMid },
    line: { type: "none" },
    rectRadius: 0.05
  });

  // 左侧彩色边框
  const tierColors = ["00ff88", "00d4ff", "0099ff", "ff8c42", "ffd700", "ff6b6b", "4ecdc4", "a855f7", "f97316"];
  slide2.addShape(pptx.ShapeType.rect, {
    x: x,
    y: y,
    w: 0.06,
    h: cardHeight,
    fill: { type: "solid", color: tierColors[index] },
    line: { type: "none" }
  });

  // 模型名称 - 等宽字体
  slide2.addText(model.name, {
    x: x + 0.15,
    y: y + 0.05,
    w: cardWidth - 0.2,
    h: 0.22,
    fontSize: 12,
    bold: true,
    color: DESIGN.colors.starWhite,
    fontFace: DESIGN.fonts.mono,
    align: "left",
    valign: "top"
  });

  // 价格信息 - 紧凑布局
  slide2.addText(`输入 ${model.input} / 1M`, {
    x: x + 0.15,
    y: y + 0.28,
    w: cardWidth - 0.2,
    h: 0.12,
    fontSize: 9,
    color: DESIGN.colors.textMuted,
    fontFace: DESIGN.fonts.english,
    align: "left",
    valign: "middle"
  });

  slide2.addText(`补全 ${model.output} / 1M`, {
    x: x + 0.15,
    y: y + 0.40,
    w: cardWidth - 0.2,
    h: 0.12,
    fontSize: 9,
    color: DESIGN.colors.textMuted,
    fontFace: DESIGN.fonts.english,
    align: "left",
    valign: "middle"
  });
});

// 价格优势区域 - 视觉焦点
const priceBoxY = 3.45;
const priceBoxH = 1.25;

// 背景光晕效果
slide2.addShape(pptx.ShapeType.rect, {
  x: 0.4,
  y: priceBoxY - 0.1,
  w: 9.2,
  h: priceBoxH + 0.2,
  fill: { type: "solid", color: DESIGN.colors.galaxyBlue, transparency: 60 },
  line: { type: "none" }
});

// 主框
slide2.addShape(pptx.ShapeType.rect, {
  x: 0.5,
  y: priceBoxY,
  w: 9,
  h: priceBoxH,
  fill: { type: "solid", color: DESIGN.colors.cardDark },
  line: { color: DESIGN.colors.cyberCyan, width: 3 }
});

// 价格标题
slide2.addText("超值定价", {
  x: 0.7,
  y: priceBoxY + 0.15,
  w: 8.6,
  h: 0.35,
  fontSize: 32,
  bold: true,
  color: DESIGN.colors.cyberCyan,
  fontFace: DESIGN.fonts.title,
  align: "left",
  valign: "middle"
});

// 核心价格 - 超大显示
slide2.addText("¥1", {
  x: 0.7,
  y: priceBoxY + 0.55,
  w: 1.5,
  h: 0.5,
  fontSize: 56,
  bold: true,
  color: DESIGN.colors.plasmaGold,
  fontFace: DESIGN.fonts.english,
  align: "left",
  valign: "middle"
});

slide2.addText("=", {
  x: 2.2,
  y: priceBoxY + 0.55,
  w: 0.4,
  h: 0.5,
  fontSize: 40,
  bold: true,
  color: DESIGN.colors.starWhite,
  fontFace: DESIGN.fonts.english,
  align: "center",
  valign: "middle"
});

slide2.addText("$100", {
  x: 2.6,
  y: priceBoxY + 0.55,
  w: 1.8,
  h: 0.5,
  fontSize: 56,
  bold: true,
  color: DESIGN.colors.plasmaGold,
  fontFace: DESIGN.fonts.english,
  align: "left",
  valign: "middle"
});

// 价值说明
slide2.addText("≈ 1500次 claude-sonnet-4.5-thinking 请求  ≈ 2000W token", {
  x: 4.6,
  y: priceBoxY + 0.65,
  w: 4.6,
  h: 0.35,
  fontSize: 15,
  color: DESIGN.colors.starWhite,
  fontFace: DESIGN.fonts.body,
  align: "left",
  valign: "middle"
});

console.log("✅ 第2页（AI模型矩阵）已创建");


// ==================== 第3页：访问地址与核心优势 - 对称布局 ====================
let slide3 = pptx.addSlide();

// 深空背景
slide3.background = { fill: DESIGN.colors.deepSpace };

// 背景装饰 - 对角线网格
for (let i = 0; i < 15; i++) {
  slide3.addShape(pptx.ShapeType.line, {
    x: 0,
    y: i * 0.4,
    w: 10,
    h: 0,
    line: { color: DESIGN.colors.cosmicPurple, width: 0.5, transparency: 92, dashType: "dash" }
  });
}

// 页面标题
slide3.addText("立即启航", {
  x: 0.5,
  y: 0.35,
  w: 9,
  h: 0.7,
  fontSize: 52,
  bold: true,
  color: DESIGN.colors.starWhite,
  fontFace: DESIGN.fonts.title,
  align: "center"
});

// 标题装饰 - 居中线条
slide3.addShape(pptx.ShapeType.rect, {
  x: 4.0,
  y: 1.1,
  w: 2.0,
  h: 0.05,
  fill: { type: "solid", color: DESIGN.colors.cyberCyan },
  line: { type: "none" }
});

// 访问地址区域 - 视觉焦点
const urlBoxY = 1.4;
const urlBoxH = 1.1;

// 背景光晕
slide3.addShape(pptx.ShapeType.rect, {
  x: 0.4,
  y: urlBoxY - 0.1,
  w: 9.2,
  h: urlBoxH + 0.2,
  fill: { type: "solid", color: DESIGN.colors.galaxyBlue, transparency: 50 },
  line: { type: "none" }
});

// 主框
slide3.addShape(pptx.ShapeType.rect, {
  x: 0.5,
  y: urlBoxY,
  w: 9,
  h: urlBoxH,
  fill: { type: "solid", color: DESIGN.colors.cardDark },
  line: { color: DESIGN.colors.cyberCyan, width: 4 }
});

// 地址图标和标签
slide3.addText("🌐", {
  x: 0.7,
  y: urlBoxY + 0.2,
  w: 0.6,
  h: 0.6,
  fontSize: 48,
  align: "center",
  valign: "middle"
});

slide3.addText("星空AI中转站", {
  x: 1.4,
  y: urlBoxY + 0.25,
  w: 7.8,
  h: 0.4,
  fontSize: 28,
  bold: true,
  color: DESIGN.colors.cyberCyan,
  fontFace: DESIGN.fonts.title,
  align: "left",
  valign: "middle"
});

// URL - 超大显示
slide3.addText("xingkongai.zeabur.app", {
  x: 1.4,
  y: urlBoxY + 0.68,
  w: 7.8,
  h: 0.4,
  fontSize: 32,
  bold: true,
  color: DESIGN.colors.plasmaGold,
  fontFace: DESIGN.fonts.mono,
  align: "left",
  valign: "middle",
  hyperlink: { url: "https://xingkongai.zeabur.app" }
});

// 核心优势标题
slide3.addText("核心优势", {
  x: 0.5,
  y: 2.75,
  w: 9,
  h: 0.5,
  fontSize: 36,
  bold: true,
  color: DESIGN.colors.starWhite,
  fontFace: DESIGN.fonts.title,
  align: "center"
});

// 优势卡片 - 现代化设计
const advantages = [
  {
    icon: "⚡",
    title: "支持高并发",
    desc: "无请求限制\n轻松应对大规模调用",
    color: "00ff88"
  },
  {
    icon: "🚀",
    title: "请求速度极快",
    desc: "毫秒级响应\n极致性能体验",
    color: "00d4ff"
  },
  {
    icon: "🌏",
    title: "国内无须魔法",
    desc: "直连访问\n稳定可靠",
    color: "ff8c42"
  }
];

const advStartY = 3.4;
const advCardW = 2.9;
const advCardH = 1.7;
const advGap = 0.15;

advantages.forEach((adv, index) => {
  const x = 0.5 + index * (advCardW + advGap);

  // 卡片背景
  slide3.addShape(pptx.ShapeType.rect, {
    x: x,
    y: advStartY,
    w: advCardW,
    h: advCardH,
    fill: { type: "solid", color: DESIGN.colors.cardMid },
    line: { type: "none" }
  });

  // 顶部彩色条
  slide3.addShape(pptx.ShapeType.rect, {
    x: x,
    y: advStartY,
    w: advCardW,
    h: 0.08,
    fill: { type: "solid", color: adv.color },
    line: { type: "none" }
  });

  // 图标背景圆
  slide3.addShape(pptx.ShapeType.ellipse, {
    x: x + (advCardW - 0.8) / 2,
    y: advStartY + 0.25,
    w: 0.8,
    h: 0.8,
    fill: { type: "solid", color: adv.color, transparency: 20 },
    line: { type: "none" }
  });

  // 图标
  slide3.addText(adv.icon, {
    x: x,
    y: advStartY + 0.25,
    w: advCardW,
    h: 0.8,
    fontSize: 56,
    align: "center",
    valign: "middle"
  });

  // 标题
  slide3.addText(adv.title, {
    x: x + 0.15,
    y: advStartY + 1.15,
    w: advCardW - 0.3,
    h: 0.3,
    fontSize: 20,
    bold: true,
    color: adv.color,
    fontFace: DESIGN.fonts.title,
    align: "center",
    valign: "middle"
  });

  // 描述
  slide3.addText(adv.desc, {
    x: x + 0.15,
    y: advStartY + 1.48,
    w: advCardW - 0.3,
    h: 0.15,
    fontSize: 13,
    color: DESIGN.colors.textMuted,
    fontFace: DESIGN.fonts.body,
    align: "center",
    valign: "top"
  });
});

console.log("✅ 第3页（立即启航）已创建");


// ==================== 第4页：快速应用案例 - 流程可视化 ====================
let slide4 = pptx.addSlide();

// 深空背景
slide4.background = { fill: DESIGN.colors.deepSpace };

// 背景装饰 - 流程线条
for (let i = 0; i < 6; i++) {
  slide4.addShape(pptx.ShapeType.line, {
    x: 0,
    y: 1.5 + i * 0.7,
    w: 10,
    h: 0,
    line: { color: DESIGN.colors.cosmicPurple, width: 1, transparency: 85, dashType: "lgDash" }
  });
}

// 页面标题
slide4.addText("快速接入", {
  x: 0.5,
  y: 0.35,
  w: 9,
  h: 0.7,
  fontSize: 52,
  bold: true,
  color: DESIGN.colors.starWhite,
  fontFace: DESIGN.fonts.title,
  align: "left"
});

// 标题装饰
slide4.addShape(pptx.ShapeType.rect, {
  x: 0.5,
  y: 1.1,
  w: 3.0,
  h: 0.05,
  fill: { type: "solid", color: DESIGN.colors.cyberCyan },
  line: { type: "none" }
});

// 步骤数据
const steps = [
  {
    num: "01",
    title: "注册账号",
    desc: "赠送 10$",
    icon: "👤",
    color: "00ff88"
  },
  {
    num: "02",
    title: "获取令牌",
    desc: "生成 API Token",
    icon: "🔑",
    color: "00d4ff"
  },
  {
    num: "03",
    title: "配置请求地址",
    desc: "xingkongai.zeabur.app",
    icon: "🌐",
    color: "0099ff"
  },
  {
    num: "04",
    title: "配置令牌",
    desc: "填入获取到的令牌",
    icon: "⚙️",
    color: "ff8c42"
  },
  {
    num: "05",
    title: "配置API格式",
    desc: "Anthropic / OpenAI",
    icon: "📋",
    color: "ffd700"
  },
  {
    num: "06",
    title: "完美应用",
    desc: "Claude Code / Kilo / OpenCode",
    icon: "✨",
    color: "ff6b9d"
  }
];

// 步骤卡片 - 现代化设计
const stepStartY = 1.35;
const stepCardW = 4.55;
const stepCardH = 0.7;
const stepGapX = 0.2;
const stepGapY = 0.18;

steps.forEach((step, index) => {
  const col = index % 2;
  const row = Math.floor(index / 2);
  const x = 0.5 + col * (stepCardW + stepGapX);
  const y = stepStartY + row * (stepCardH + stepGapY);

  // 卡片背景
  slide4.addShape(pptx.ShapeType.rect, {
    x: x,
    y: y,
    w: stepCardW,
    h: stepCardH,
    fill: { type: "solid", color: DESIGN.colors.cardMid },
    line: { type: "none" }
  });

  // 左侧编号区域
  slide4.addShape(pptx.ShapeType.rect, {
    x: x,
    y: y,
    w: 0.65,
    h: stepCardH,
    fill: { type: "solid", color: step.color },
    line: { type: "none" }
  });

  // 步骤编号
  slide4.addText(step.num, {
    x: x,
    y: y,
    w: 0.65,
    h: stepCardH,
    fontSize: 28,
    bold: true,
    color: DESIGN.colors.deepSpace,
    fontFace: DESIGN.fonts.mono,
    align: "center",
    valign: "middle"
  });

  // 图标
  slide4.addText(step.icon, {
    x: x + 0.75,
    y: y + 0.1,
    w: 0.5,
    h: 0.5,
    fontSize: 32,
    align: "center",
    valign: "middle"
  });

  // 标题
  slide4.addText(step.title, {
    x: x + 1.3,
    y: y + 0.12,
    w: stepCardW - 1.4,
    h: 0.25,
    fontSize: 18,
    bold: true,
    color: DESIGN.colors.starWhite,
    fontFace: DESIGN.fonts.title,
    align: "left",
    valign: "top"
  });

  // 描述
  slide4.addText(step.desc, {
    x: x + 1.3,
    y: y + 0.42,
    w: stepCardW - 1.4,
    h: 0.2,
    fontSize: 13,
    color: DESIGN.colors.textMuted,
    fontFace: DESIGN.fonts.body,
    align: "left",
    valign: "top"
  });

  // 连接箭头（除了最后一个）
  if (index < steps.length - 1) {
    const nextCol = (index + 1) % 2;
    const nextRow = Math.floor((index + 1) / 2);
    
    if (col === 0 && nextCol === 1) {
      // 同行，向右箭头
      slide4.addShape(pptx.ShapeType.rightArrow, {
        x: x + stepCardW + 0.05,
        y: y + stepCardH / 2 - 0.08,
        w: 0.1,
        h: 0.16,
        fill: { type: "solid", color: DESIGN.colors.cyberCyan, transparency: 50 },
        line: { type: "none" }
      });
    } else if (col === 1 && nextCol === 0) {
      // 换行，向下箭头
      slide4.addShape(pptx.ShapeType.downArrow, {
        x: x + stepCardW / 2 - 0.08,
        y: y + stepCardH + 0.02,
        w: 0.16,
        h: 0.12,
        fill: { type: "solid", color: DESIGN.colors.cyberCyan, transparency: 50 },
        line: { type: "none" }
      });
    }
  }
});

// 底部提示框
const tipY = stepStartY + 3 * (stepCardH + stepGapY) + 0.1;

slide4.addShape(pptx.ShapeType.rect, {
  x: 0.5,
  y: tipY,
  w: 9.3,
  h: 0.65,
  fill: { type: "solid", color: DESIGN.colors.galaxyBlue },
  line: { color: DESIGN.colors.plasmaGold, width: 2 }
});

slide4.addText("💡", {
  x: 0.7,
  y: tipY + 0.08,
  w: 0.5,
  h: 0.5,
  fontSize: 32,
  align: "center",
  valign: "middle"
});

slide4.addText("新用户注册即送 10$ 额度，立即开始体验！", {
  x: 1.3,
  y: tipY + 0.12,
  w: 7.8,
  h: 0.4,
  fontSize: 20,
  bold: true,
  color: DESIGN.colors.plasmaGold,
  fontFace: DESIGN.fonts.title,
  align: "left",
  valign: "middle"
});

console.log("✅ 第4页（快速接入）已创建");


// ==================== 第5页：售后服务与技术支持 - 中心对称设计 ====================
let slide5 = pptx.addSlide();

// 深空背景
slide5.background = { fill: DESIGN.colors.deepSpace };

// 背景装饰 - 放射状线条
const centerX = 5;
const centerY = 2.8125;
for (let i = 0; i < 12; i++) {
  const angle = (i * 30) * Math.PI / 180;
  const length = 3;
  const x1 = centerX + Math.cos(angle) * 0.5;
  const y1 = centerY + Math.sin(angle) * 0.5;
  const x2 = centerX + Math.cos(angle) * length;
  const y2 = centerY + Math.sin(angle) * length;
  
  slide5.addShape(pptx.ShapeType.line, {
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1,
    line: { color: DESIGN.colors.cosmicPurple, width: 1, transparency: 88 }
  });
}

// 页面标题
slide5.addText("全程护航", {
  x: 0.5,
  y: 0.35,
  w: 9,
  h: 0.7,
  fontSize: 52,
  bold: true,
  color: DESIGN.colors.starWhite,
  fontFace: DESIGN.fonts.title,
  align: "center"
});

// 标题装饰
slide5.addShape(pptx.ShapeType.rect, {
  x: 4.0,
  y: 1.1,
  w: 2.0,
  h: 0.05,
  fill: { type: "solid", color: DESIGN.colors.cyberCyan },
  line: { type: "none" }
});

// 中心服务承诺区域
const serviceY = 1.5;
const serviceW = 7.5;
const serviceH = 1.4;

// 背景光晕
slide5.addShape(pptx.ShapeType.ellipse, {
  x: (10 - serviceW - 0.4) / 2,
  y: serviceY - 0.2,
  w: serviceW + 0.4,
  h: serviceH + 0.4,
  fill: { type: "solid", color: DESIGN.colors.galaxyBlue, transparency: 60 },
  line: { type: "none" }
});

// 主框
slide5.addShape(pptx.ShapeType.rect, {
  x: (10 - serviceW) / 2,
  y: serviceY,
  w: serviceW,
  h: serviceH,
  fill: { type: "solid", color: DESIGN.colors.cardMid },
  line: { color: DESIGN.colors.cyberCyan, width: 3 }
});

// 服务图标
slide5.addText("🛡️", {
  x: (10 - serviceW) / 2,
  y: serviceY + 0.15,
  w: serviceW,
  h: 0.6,
  fontSize: 64,
  align: "center",
  valign: "middle"
});

// 服务标题
slide5.addText("完整的售后服务", {
  x: (10 - serviceW) / 2,
  y: serviceY + 0.8,
  w: serviceW,
  h: 0.4,
  fontSize: 32,
  bold: true,
  color: DESIGN.colors.cyberCyan,
  fontFace: DESIGN.fonts.title,
  align: "center",
  valign: "middle"
});

// QQ群区域
const qqY = 3.1;
const qqW = 6.5;
const qqH = 1.6;

// 背景
slide5.addShape(pptx.ShapeType.rect, {
  x: (10 - qqW) / 2,
  y: qqY,
  w: qqW,
  h: qqH,
  fill: { type: "solid", color: DESIGN.colors.cardDark },
  line: { color: DESIGN.colors.plasmaGold, width: 4 }
});

// 顶部装饰条
slide5.addShape(pptx.ShapeType.rect, {
  x: (10 - qqW) / 2,
  y: qqY,
  w: qqW,
  h: 0.1,
  fill: { type: "solid", color: DESIGN.colors.plasmaGold },
  line: { type: "none" }
});

// QQ图标
slide5.addText("💬", {
  x: (10 - qqW) / 2,
  y: qqY + 0.25,
  w: qqW,
  h: 0.5,
  fontSize: 48,
  align: "center",
  valign: "middle"
});

// 加入QQ群文本
slide5.addText("加入技术支持QQ群", {
  x: (10 - qqW) / 2,
  y: qqY + 0.8,
  w: qqW,
  h: 0.35,
  fontSize: 26,
  bold: true,
  color: DESIGN.colors.starWhite,
  fontFace: DESIGN.fonts.title,
  align: "center",
  valign: "middle"
});

// QQ群号 - 超大显示
slide5.addText("978772109", {
  x: (10 - qqW) / 2,
  y: qqY + 1.15,
  w: qqW,
  h: 0.4,
  fontSize: 40,
  bold: true,
  color: DESIGN.colors.plasmaGold,
  fontFace: DESIGN.fonts.mono,
  align: "center",
  valign: "middle"
});

// 底部服务承诺
slide5.addText("7×24 小时技术支持  ·  随时为您解答疑问", {
  x: 1.0,
  y: 5.0,
  w: 8.0,
  h: 0.4,
  fontSize: 16,
  color: DESIGN.colors.textMuted,
  fontFace: DESIGN.fonts.body,
  align: "center",
  valign: "middle"
});

console.log("✅ 第5页（全程护航）已创建");

// ==================== 保存PPT ====================
pptx.writeFile({ fileName: "星空AI宣传PPT_视觉重构版.pptx" })
  .then(() => {
    console.log("\n🎉 PPT生成成功：星空AI宣传PPT_视觉重构版.pptx");
    console.log("\n✨ 设计优化完成：");
    console.log("   - 深空宇宙主题，黑洞视觉效果");
    console.log("   - 赛博朋克配色，科技感十足");
    console.log("   - 现代化卡片设计，视觉层次分明");
    console.log("   - 统一的设计系统，专业大气");
  })
  .catch((err) => {
    console.error("❌ 生成失败:", err);
  });

