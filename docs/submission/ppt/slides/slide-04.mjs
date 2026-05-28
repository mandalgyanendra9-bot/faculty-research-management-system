import { addHeader, addBullets } from "./theme.mjs";

export async function slide04(presentation, ctx) {
  const slide = presentation.slides.add();
  addHeader(slide, ctx, "System Architecture", "Modern web architecture");
  addBullets(slide, ctx, [
  "Frontend: React + Vite + Tailwind on Vercel",
  "Backend: Node.js + Express APIs on Render",
  "Database: MongoDB Atlas with Mongoose models",
  ], 228);
  return slide;
}
