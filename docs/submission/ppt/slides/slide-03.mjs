import { addHeader, addBullets } from "./theme.mjs";

export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add();
  addHeader(slide, ctx, "Proposed Solution", "Integrated digital system");
  addBullets(slide, ctx, [
  "Single portal for faculty, HOD, admin, and coordinators",
  "Automated approval workflow with full status tracking",
  "Built-in reports, dashboards, and AI assistance",
  ], 228);
  return slide;
}
