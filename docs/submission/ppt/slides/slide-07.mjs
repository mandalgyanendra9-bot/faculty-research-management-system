import { addHeader, addBullets } from "./theme.mjs";

export async function slide07(presentation, ctx) {
  const slide = presentation.slides.add();
  addHeader(slide, ctx, "Reporting Engine", "Accreditation and management reporting");
  addBullets(slide, ctx, [
  "Faculty-wise, department-wise, year-wise reports",
  "NAAC Criterion III and NBA/NIRF report generation",
  "PDF and Excel export with downloadable files",
  ], 228);
  return slide;
}
