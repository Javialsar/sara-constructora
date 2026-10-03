import sharp from "sharp"
import { mkdirSync } from "node:fs"

// Fuente del logo y color de fondo por pilar.
// NOTA: SARA APU no tiene logo propio; usa el de Constructora sobre fondo verde hasta que haya uno.
const APPS = {
  constructora: { src: "public/logo-hero.png", bg: "#1e3a8a" },
  apu: { src: "public/logo-hero.png", bg: "#059669" },
  inmobiliaria: { src: "public/sara-inmobiliaria.png", bg: "#020617" },
  stays: { src: "public/sara-stays.png", bg: "#0f172a" },
}

mkdirSync("public/icons", { recursive: true })

async function make(srcPath, bg, size, logoRatio, outPath) {
  const inner = Math.round(size * logoRatio)
  const logo = await sharp(srcPath)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(outPath)
}

for (const [id, { src, bg }] of Object.entries(APPS)) {
  await make(src, bg, 192, 0.86, `public/icons/${id}-192.png`)
  await make(src, bg, 512, 0.86, `public/icons/${id}-512.png`)
  // Maskable: el logo debe caber en la "zona segura" (~60% central)
  await make(src, bg, 512, 0.6, `public/icons/${id}-maskable-512.png`)
  console.log("ok", id)
}
