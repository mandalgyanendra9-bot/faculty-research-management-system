import { addHeader, addBullets } from "./theme.mjs";

export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add();
  addHeader(slide, ctx, "Problem Statement", "Existing process limitations");
  addBullets(slide, ctx, [
  "Research records scattered across sheets and emails",
  "Manual approvals cause delays and low traceability",
  "Generating NAAC/NBA/NIRF reports is time-consuming",
  ], 228);
  return slide;
}
