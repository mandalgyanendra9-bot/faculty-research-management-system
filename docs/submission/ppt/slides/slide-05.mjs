import { addHeader, addBullets } from "./theme.mjs";

export async function slide05(presentation, ctx) {
  const slide = presentation.slides.add();
  addHeader(slide, ctx, "Core Modules", "Research data lifecycle");
  addBullets(slide, ctx, [
  "Publications, Projects, Patents, Grants, Events",
  "Faculty profiles and master data management",
  "Notifications and audit logs for governance",
  ], 228);
  return slide;
}
