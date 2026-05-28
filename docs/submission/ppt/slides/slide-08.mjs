import { addHeader, addBullets } from "./theme.mjs";

export async function slide08(presentation, ctx) {
  const slide = presentation.slides.add();
  addHeader(slide, ctx, "AI Research Intelligence Suite", "Productivity and insight features");
  addBullets(slide, ctx, [
  "Research paper summary from uploaded PDF",
  "Publication recommendation and semantic search",
  "Citation insights, OCR, proposal and CV assistant",
  ], 228);
  return slide;
}
