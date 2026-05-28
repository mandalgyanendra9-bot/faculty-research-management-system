import { addHeader, addBullets } from "./theme.mjs";

export async function slide10(presentation, ctx) {
  const slide = presentation.slides.add();
  addHeader(slide, ctx, "UI and UX Highlights", "Usability improvements");
  addBullets(slide, ctx, [
  "Responsive layout for desktop and mobile screens",
  "Dark mode with persistent user preference",
  "Loading skeletons, improved charts, toast feedback",
  ], 228);
  return slide;
}
