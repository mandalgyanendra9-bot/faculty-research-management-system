import { addHeader, addBullets } from "./theme.mjs";

export async function slide09(presentation, ctx) {
  const slide = presentation.slides.add();
  addHeader(slide, ctx, "Security and Compliance", "Production safeguards");
  addBullets(slide, ctx, [
  "JWT authentication and role-based access control",
  "bcrypt password hashing and validation middleware",
  "Helmet, rate limiting, and audit trail logging",
  ], 228);
  return slide;
}
