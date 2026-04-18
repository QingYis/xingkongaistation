const PptxGenJS = require("pptxgenjs");

let pptx = new PptxGenJS();

// 设置PPT尺寸为16:9
pptx.layout = "LAYOUT_16x9";
pptx.author = "星空AI";
pptx.title = "星空AI - 下一代AI API网关";

// ==================== 第1页：封面页 ====================
let slide1 = pptx.addSlide();

// 深色星空背景（深紫到黑色渐变）
slide1.background = { fill: "1a1a2e" };

// 添加渐变效果的装饰形状（模拟星空/黑洞效果）
slide1.addShape(pptx.ShapeType.ellipse, {
  x: 7.5,
  y: 1.5,
  w: 4,
  h: 4,
  fill: { type: "solid", color: "16213e", transparency: 50 },
  line: { type: "none" }
});

slide1.addShape(pptx.ShapeType.ellipse, {
  x: 8,
  y: 2,
  w: 3,
  h: 3,
  fill: { type: "solid", color: "0f3460", transparency: 60 },
  line: { type: "none" }
});

slide1.addShape(pptx.ShapeType.ellipse, {
  x: 8.5,
  y: 2.5,
  w: 2,
  h: 2,
  fill: { type: "solid", color: "533483", transparency: 40 },
  line: { type: "none" }
});

// 左侧装饰线条（科技感）
slide1.addShape(pptx.ShapeType.line, {
  x: 0.5,
  y: 2.8,
  w: 2,
  h: 0,
  line: { color: "00d4ff", width: 3 }
});

slide1.addShape(pptx.ShapeType.line, {
  x: 0.5,
  y: 3.2,
  w: 1.5,
  h: 0,
  line: { color: "00d4ff", width: 2, transparency: 50 }
});

// 主标题：星空AI
slide1.addText("星空AI", {
  x: 0.5,
  y: 2.0,
  w: 6,
  h: 1.2,
  fontSize: 72,
  bold: true,
  color: "ffffff",
  fontFace: "Microsoft YaHei",
  align: "left",
  valign: "middle"
});

// 副标题
slide1.addText("卷爆所有中转站的星空AI来了！", {
  x: 0.5,
  y: 3.5,
  w: 6,
  h: 0.6,
  fontSize: 24,
  color: "00d4ff",
  fontFace: "Microsoft YaHei",
  align: "left",
  valign: "middle"
});

// 底部标签
slide1.addText("Next-Generation AI API Gateway", {
  x: 0.5,
  y: 4.8,
  w: 6,
  h: 0.4,
  fontSize: 16,
  color: "a0a0a0",
  fontFace: "Arial",
  align: "left",
  italic: true
});

// 右下角装饰元素（小星点）
for (let i = 0; i < 15; i++) {
  const x = 8 + Math.random() * 4;
  const y = 1 + Math.random() * 4;
  const size = 0.02 + Math.random() * 0.04;

  slide1.addShape(pptx.ShapeType.ellipse, {
    x: x,
    y: y,
    w: size,
    h: size,
    fill: { type: "solid", color: "ffffff", transparency: 30 + Math.random() * 40 },
    line: { type: "none" }
  });
}

console.log("✅ 第1页（封面页）已创建");

// ==================== 第2页：支持的模型与价格 ====================
let slide2 = pptx.addSlide();

// 深色背景
slide2.background = { fill: "1a1a2e" };

// 页面标题
slide2.addText("支持的AI模型", {
  x: 0.5,
  y: 0.4,
  w: 12,
  h: 0.6,
  fontSize: 40,
  bold: true,
  color: "ffffff",
  fontFace: "Microsoft YaHei",
  align: "left"
});

// 标题装饰线
slide2.addShape(pptx.ShapeType.line, {
  x: 0.5,
  y: 1.05,
  w: 2.5,
  h: 0,
  line: { color: "00d4ff", width: 3 }
});

// 模型数据
const models = [
  {
    name: "claude-haiku-4.5",
    input: "$1.0000 / 1M Tokens",
    output: "$5.0000 / 1M Tokens"
  },
  {
    name: "claude-haiku-4.5-thinking",
    input: "$1.5000 / 1M Tokens",
    output: "$7.5000 / 1M Tokens"
  },
  {
    name: "claude-sonnet-4",
    input: "$2.0000 / 1M Tokens",
    output: "$10.0000 / 1M Tokens"
  },
  {
    name: "claude-sonnet-4.5",
    input: "$2.5000 / 1M Tokens",
    output: "$12.5000 / 1M Tokens"
  },
  {
    name: "claude-sonnet-4.5-thinking",
    input: "$3.7500 / 1M Tokens",
    output: "$18.7500 / 1M Tokens"
  }
];

// 绘制模型卡片（2列布局）
// PPT 16:9尺寸是10英寸宽 x 5.625英寸高
let startY = 1.2;
let gap = 0.25;
let cardWidth = (10 - 0.5 - 0.5 - gap) / 2; // = 4.375
let cardHeight = 0.65;

models.forEach((model, index) => {
  const col = index % 2;
  const row = Math.floor(index / 2);
  const x = 0.5 + col * (cardWidth + gap);
  const y = startY + row * (cardHeight + gap);

  // 卡片背景
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: x,
    y: y,
    w: cardWidth,
    h: cardHeight,
    fill: { type: "solid", color: "2d2d44" },
    line: { color: "3d3d5c", width: 1 }
  });

  // 模型图标（橙色星形装饰）
  slide2.addShape(pptx.ShapeType.star5, {
    x: x + 0.15,
    y: y + 0.15,
    w: 0.35,
    h: 0.35,
    fill: { type: "solid", color: "ff8c42" },
    line: { type: "none" }
  });

  // 模型名称
  slide2.addText(model.name, {
    x: x + 0.6,
    y: y + 0.12,
    w: cardWidth - 0.7,
    h: 0.4,
    fontSize: 18,
    bold: true,
    color: "ffffff",
    fontFace: "Arial",
    align: "left",
    valign: "top"
  });

  // 输入价格
  slide2.addText(`输入价格 ${model.input}`, {
    x: x + 0.6,
    y: y + 0.52,
    w: cardWidth - 0.7,
    h: 0.2,
    fontSize: 12,
    color: "b0b0b0",
    fontFace: "Arial",
    align: "left"
  });

  // 输出价格
  slide2.addText(`补全价格 ${model.output}`, {
    x: x + 0.6,
    y: y + 0.72,
    w: cardWidth - 0.7,
    h: 0.2,
    fontSize: 12,
    color: "b0b0b0",
    fontFace: "Arial",
    align: "left"
  });
});

// 价格优势高亮区域（底部）
// PPT高度是5.625英寸，确保价格框完全在可见范围内
const priceBoxY = 4.4;

slide2.addShape(pptx.ShapeType.roundRect, {
  x: 0.5,
  y: priceBoxY,
  w: 9,
  h: 1.0,
  fill: { type: "solid", color: "0f3460" },
  line: { color: "00d4ff", width: 3 }
});

// 价格优势标题
slide2.addText("💰 超值价格", {
  x: 0.7,
  y: priceBoxY + 0.12,
  w: 8.5,
  h: 0.3,
  fontSize: 24,
  bold: true,
  color: "00d4ff",
  fontFace: "Microsoft YaHei",
  align: "left",
  valign: "middle"
});

// 价格说明（分成两行显示）
slide2.addText("¥1 = $100", {
  x: 0.7,
  y: priceBoxY + 0.48,
  w: 8.5,
  h: 0.22,
  fontSize: 20,
  bold: true,
  color: "ffcc00",
  fontFace: "Arial",
  align: "left",
  valign: "middle"
});

slide2.addText("≈ 1500次 claude-sonnet-4.5-thinking 请求 ≈ 2000W token", {
  x: 0.7,
  y: priceBoxY + 0.72,
  w: 8.5,
  h: 0.22,
  fontSize: 15,
  color: "ffffff",
  fontFace: "Microsoft YaHei",
  align: "left",
  valign: "middle"
});

console.log("✅ 第2页（支持的模型与价格）已创建");

// ==================== 第3页：访问地址与核心优势 ====================
let slide3 = pptx.addSlide();

// 深色背景
slide3.background = { fill: "1a1a2e" };

// 页面标题
slide3.addText("立即体验", {
  x: 0.5,
  y: 0.4,
  w: 9,
  h: 0.6,
  fontSize: 40,
  bold: true,
  color: "ffffff",
  fontFace: "Microsoft YaHei",
  align: "left"
});

// 标题装饰线
slide3.addShape(pptx.ShapeType.line, {
  x: 0.5,
  y: 1.05,
  w: 2.0,
  h: 0,
  line: { color: "00d4ff", width: 3 }
});

// 中转站地址区域
slide3.addShape(pptx.ShapeType.roundRect, {
  x: 0.5,
  y: 1.4,
  w: 9,
  h: 0.9,
  fill: { type: "solid", color: "0f3460" },
  line: { color: "00d4ff", width: 3 }
});

// 地址标签
slide3.addText("🌐 星空AI中转站地址", {
  x: 0.7,
  y: 1.55,
  w: 8.5,
  h: 0.3,
  fontSize: 22,
  bold: true,
  color: "00d4ff",
  fontFace: "Microsoft YaHei",
  align: "left",
  valign: "middle"
});

// URL地址
slide3.addText("https://xingkongai.zeabur.app", {
  x: 0.7,
  y: 1.95,
  w: 8.5,
  h: 0.3,
  fontSize: 24,
  bold: true,
  color: "ffcc00",
  fontFace: "Arial",
  align: "left",
  valign: "middle",
  hyperlink: { url: "https://xingkongai.zeabur.app" }
});

// 核心优势标题
slide3.addText("核心优势", {
  x: 0.5,
  y: 2.6,
  w: 9,
  h: 0.5,
  fontSize: 32,
  bold: true,
  color: "ffffff",
  fontFace: "Microsoft YaHei",
  align: "left"
});

// 优势卡片数据
const advantages = [
  {
    icon: "⚡",
    title: "支持高并发",
    desc: "无请求限制，轻松应对大规模调用"
  },
  {
    icon: "🚀",
    title: "请求速度极快",
    desc: "毫秒级响应，极致性能体验"
  },
  {
    icon: "🌏",
    title: "国内无须魔法",
    desc: "直连访问，稳定可靠"
  }
];

// 绘制优势卡片（3列布局）
const cardStartY = 3.3;
const cardW = 2.8;
const cardH = 1.8;
const cardGap = 0.3;

advantages.forEach((adv, index) => {
  const x = 0.5 + index * (cardW + cardGap);

  // 卡片背景
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: x,
    y: cardStartY,
    w: cardW,
    h: cardH,
    fill: { type: "solid", color: "2d2d44" },
    line: { color: "3d3d5c", width: 1 }
  });

  // 图标
  slide3.addText(adv.icon, {
    x: x,
    y: cardStartY + 0.25,
    w: cardW,
    h: 0.5,
    fontSize: 48,
    align: "center",
    valign: "middle"
  });

  // 标题
  slide3.addText(adv.title, {
    x: x + 0.15,
    y: cardStartY + 0.85,
    w: cardW - 0.3,
    h: 0.35,
    fontSize: 20,
    bold: true,
    color: "00d4ff",
    fontFace: "Microsoft YaHei",
    align: "center",
    valign: "middle"
  });

  // 描述
  slide3.addText(adv.desc, {
    x: x + 0.15,
    y: cardStartY + 1.25,
    w: cardW - 0.3,
    h: 0.45,
    fontSize: 14,
    color: "b0b0b0",
    fontFace: "Microsoft YaHei",
    align: "center",
    valign: "top"
  });
});

console.log("✅ 第3页（访问地址与核心优势）已创建");

// ==================== 第4页：快速应用案例 ====================
let slide4 = pptx.addSlide();

// 深色背景
slide4.background = { fill: "1a1a2e" };

// 页面标题
slide4.addText("快速应用案例", {
  x: 0.5,
  y: 0.4,
  w: 9,
  h: 0.6,
  fontSize: 40,
  bold: true,
  color: "ffffff",
  fontFace: "Microsoft YaHei",
  align: "left"
});

// 标题装饰线
slide4.addShape(pptx.ShapeType.line, {
  x: 0.5,
  y: 1.05,
  w: 2.5,
  h: 0,
  line: { color: "00d4ff", width: 3 }
});

// 应用步骤
const steps = [
  {
    num: "1",
    title: "注册账号",
    desc: "赠送 10$",
    icon: "👤"
  },
  {
    num: "2",
    title: "获取令牌",
    desc: "生成 API Token",
    icon: "🔑"
  },
  {
    num: "3",
    title: "配置请求地址",
    desc: "https://xingkongai.zeabur.app",
    icon: "🌐"
  },
  {
    num: "4",
    title: "配置令牌",
    desc: "填入获取到的令牌",
    icon: "⚙️"
  },
  {
    num: "5",
    title: "配置API格式",
    desc: "Anthropic / OpenAI",
    icon: "📋"
  },
  {
    num: "6",
    title: "完美应用",
    desc: "Claude Code / Kilo / OpenCode 等",
    icon: "✨"
  }
];

// 绘制步骤卡片（2列3行布局）
const stepStartY = 1.3;
const stepCardW = 4.4;
const stepCardH = 0.65;
const stepGapX = 0.3;
const stepGapY = 0.2;

steps.forEach((step, index) => {
  const col = index % 2;
  const row = Math.floor(index / 2);
  const x = 0.5 + col * (stepCardW + stepGapX);
  const y = stepStartY + row * (stepCardH + stepGapY);

  // 卡片背景
  slide4.addShape(pptx.ShapeType.roundRect, {
    x: x,
    y: y,
    w: stepCardW,
    h: stepCardH,
    fill: { type: "solid", color: "2d2d44" },
    line: { color: "00d4ff", width: 2 }
  });

  // 步骤编号圆圈
  slide4.addShape(pptx.ShapeType.ellipse, {
    x: x + 0.15,
    y: y + 0.15,
    w: 0.35,
    h: 0.35,
    fill: { type: "solid", color: "00d4ff" },
    line: { type: "none" }
  });

  slide4.addText(step.num, {
    x: x + 0.15,
    y: y + 0.15,
    w: 0.35,
    h: 0.35,
    fontSize: 18,
    bold: true,
    color: "1a1a2e",
    fontFace: "Arial",
    align: "center",
    valign: "middle"
  });

  // 图标
  slide4.addText(step.icon, {
    x: x + 0.6,
    y: y + 0.12,
    w: 0.4,
    h: 0.4,
    fontSize: 24,
    align: "center",
    valign: "middle"
  });

  // 标题
  slide4.addText(step.title, {
    x: x + 1.05,
    y: y + 0.12,
    w: stepCardW - 1.2,
    h: 0.2,
    fontSize: 16,
    bold: true,
    color: "ffffff",
    fontFace: "Microsoft YaHei",
    align: "left",
    valign: "middle"
  });

  // 描述
  slide4.addText(step.desc, {
    x: x + 1.05,
    y: y + 0.35,
    w: stepCardW - 1.2,
    h: 0.2,
    fontSize: 12,
    color: "b0b0b0",
    fontFace: "Microsoft YaHei",
    align: "left",
    valign: "middle"
  });
});

// 底部提示
const tipY = stepStartY + 3 * (stepCardH + stepGapY) + 0.15;

slide4.addShape(pptx.ShapeType.roundRect, {
  x: 0.5,
  y: tipY,
  w: 9.2,
  h: 0.6,
  fill: { type: "solid", color: "0f3460" },
  line: { color: "00d4ff", width: 2 }
});

slide4.addText("💡 提示：新用户注册即送 10$ 额度，立即开始体验！", {
  x: 0.7,
  y: tipY + 0.1,
  w: 8.8,
  h: 0.4,
  fontSize: 18,
  bold: true,
  color: "ffcc00",
  fontFace: "Microsoft YaHei",
  align: "left",
  valign: "middle"
});

console.log("✅ 第4页（快速应用案例）已创建");

// ==================== 第5页：售后服务与技术支持 ====================
let slide5 = pptx.addSlide();

// 深色背景
slide5.background = { fill: "1a1a2e" };

// 页面标题
slide5.addText("售后服务与技术支持", {
  x: 0.5,
  y: 0.4,
  w: 9,
  h: 0.6,
  fontSize: 40,
  bold: true,
  color: "ffffff",
  fontFace: "Microsoft YaHei",
  align: "center"
});

// 标题装饰线（居中）
slide5.addShape(pptx.ShapeType.line, {
  x: 4.0,
  y: 1.05,
  w: 2.0,
  h: 0,
  line: { color: "00d4ff", width: 3 }
});

// 中心内容区域
const centerY = 2.0;

// 服务承诺卡片
slide5.addShape(pptx.ShapeType.roundRect, {
  x: 1.5,
  y: centerY,
  w: 7.0,
  h: 1.2,
  fill: { type: "solid", color: "2d2d44" },
  line: { color: "00d4ff", width: 2 }
});

// 图标
slide5.addText("🛡️", {
  x: 1.5,
  y: centerY + 0.1,
  w: 7.0,
  h: 0.5,
  fontSize: 48,
  align: "center",
  valign: "middle"
});

// 服务标题
slide5.addText("完整的售后服务", {
  x: 1.5,
  y: centerY + 0.65,
  w: 7.0,
  h: 0.4,
  fontSize: 28,
  bold: true,
  color: "00d4ff",
  fontFace: "Microsoft YaHei",
  align: "center",
  valign: "middle"
});

// QQ群区域
const qqY = centerY + 1.5;

slide5.addShape(pptx.ShapeType.roundRect, {
  x: 2.0,
  y: qqY,
  w: 6.0,
  h: 1.5,
  fill: { type: "solid", color: "0f3460" },
  line: { color: "00d4ff", width: 3 }
});

// QQ图标
slide5.addText("💬", {
  x: 2.0,
  y: qqY + 0.15,
  w: 6.0,
  h: 0.4,
  fontSize: 36,
  align: "center",
  valign: "middle"
});

// 加入QQ群文本
slide5.addText("加入技术支持QQ群", {
  x: 2.0,
  y: qqY + 0.6,
  w: 6.0,
  h: 0.35,
  fontSize: 24,
  bold: true,
  color: "ffffff",
  fontFace: "Microsoft YaHei",
  align: "center",
  valign: "middle"
});

// QQ群号
slide5.addText("978772109", {
  x: 2.0,
  y: qqY + 1.0,
  w: 6.0,
  h: 0.4,
  fontSize: 32,
  bold: true,
  color: "ffcc00",
  fontFace: "Arial",
  align: "center",
  valign: "middle"
});

// 底部提示
slide5.addText("我们提供 7×24 小时技术支持，随时为您解答疑问", {
  x: 1.0,
  y: 5.0,
  w: 8.0,
  h: 0.4,
  fontSize: 16,
  color: "b0b0b0",
  fontFace: "Microsoft YaHei",
  align: "center",
  valign: "middle",
  italic: true
});

console.log("✅ 第5页（售后服务与技术支持）已创建");

// 保存PPT
pptx.writeFile({ fileName: "星空AI宣传PPT.pptx" })
  .then(() => {
    console.log("\n🎉 PPT生成成功：星空AI宣传PPT.pptx");
  })
  .catch((err) => {
    console.error("❌ 生成失败:", err);
  });
