export const colors = {
  bg: "#0b1220",
  panel: "#111a2f",
  accent: "#22d3ee",
  text: "#e2e8f0",
  muted: "#94a3b8",
};

export function drawFrame(slide, ctx) {
  ctx.addShape(slide, { x: 0, y: 0, w: 1280, h: 720, fill: colors.bg, line: ctx.line(colors.bg, 0) });
  ctx.addShape(slide, { x: 0, y: 0, w: 1280, h: 64, fill: colors.panel, line: ctx.line(colors.panel, 0) });
  ctx.addShape(slide, { x: 32, y: 24, w: 8, h: 20, fill: colors.accent, line: ctx.line(colors.accent, 0) });
}

export function addHeader(slide, ctx, title, subtitle = "") {
  drawFrame(slide, ctx);
  ctx.addText(slide, { text: "FRMS Submission", x: 52, y: 18, w: 300, h: 28, size: 17, color: colors.text, bold: true, valign: "middle" });
  ctx.addText(slide, { text: title, x: 52, y: 92, w: 1160, h: 58, size: 42, color: colors.text, bold: true });
  if (subtitle) {
    ctx.addText(slide, { text: subtitle, x: 52, y: 150, w: 1120, h: 40, size: 20, color: colors.muted });
  }
}

export function addBullets(slide, ctx, items, startY = 220) {
  let y = startY;
  for (const item of items) {
    ctx.addText(slide, { text: "•", x: 70, y, w: 20, h: 26, size: 24, color: colors.accent, bold: true });
    ctx.addText(slide, { text: item, x: 96, y, w: 1080, h: 52, size: 24, color: colors.text });
    y += 56;
  }
}
