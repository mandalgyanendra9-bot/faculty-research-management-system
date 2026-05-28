import { addHeader, addBullets } from "./theme.mjs";

export async function slide06(presentation, ctx) {
  const slide = presentation.slides.add();
  addHeader(slide, ctx, "Approval Workflow", "Two-level review pipeline");
  addBullets(slide, ctx, [
  "Faculty submits records with document proof",
  "Reviewer verifies and admin finalizes decision",
  "Rejections require reason; all actions auditable",
  ], 228);
  return slide;
}
