import { addHeader, addBullets } from "./theme.mjs";

export async function slide11(presentation, ctx) {
  const slide = presentation.slides.add();
  addHeader(slide, ctx, "Testing and Validation", "Quality assurance checks");
  addBullets(slide, ctx, [
  "API smoke checks and role-access verification",
  "Public registration security checks",
  "Frontend production build and deployment verification",
  ], 228);
  return slide;
}
