import { addHeader, addBullets } from "./theme.mjs";

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  addHeader(slide, ctx, "Faculty Research Management System", "Final Project Submission");
  addBullets(slide, ctx, [
  "Centralized research lifecycle management platform",
  "College accreditation-ready reporting and analytics",
  "Secure role-based web application",
  ], 228);
  return slide;
}
