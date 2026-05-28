import { addHeader, addBullets } from "./theme.mjs";

export async function slide12(presentation, ctx) {
  const slide = presentation.slides.add();
  addHeader(slide, ctx, "Conclusion and Future Scope", "Project outcome");
  addBullets(slide, ctx, [
  "FRMS streamlines institutional research operations",
  "Improves transparency, speed, and reporting quality",
  "Future scope: SSO, email automation, advanced BI",
  ], 228);
  return slide;
}
