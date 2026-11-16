import { Resvg } from "@resvg/resvg-js";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { mahjongMark } from "../src/constants/brand.ts";

const folder = fileURLToPath(new URL("../assets/images/", import.meta.url));
await mkdir(folder, { recursive: true });
const body = mahjongMark.replace(/<svg[^>]*>/, "").replace("</svg>", "");
const svg = (inside) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">${inside}</svg>`;
const icon = svg(`<rect width="256" height="256" fill="#1E3A8A"/>${body}`);
const mono = svg(
  `<defs><mask id="tile"><rect x="43" y="27" width="162" height="200" rx="38" fill="white"/><path d="M94 68 H146 V102 H94 Z M120 52 V118" fill="none" stroke="black" stroke-width="8"/><circle cx="92" cy="146" r="7"/><circle cx="148" cy="146" r="7"/><path d="M107 165 Q120 180 133 165" fill="none" stroke="black" stroke-width="6" stroke-linecap="round"/></mask></defs><rect width="256" height="256" fill="white" mask="url(#tile)"/>`,
);
for (const [name, source, width] of [
  ["icon", icon, 1024],
  ["splash-icon", mahjongMark, 512],
  ["android-icon-foreground", mahjongMark, 1024],
  ["android-icon-monochrome", mono, 1024],
  ["favicon", icon, 64],
]) {
  const rendered = new Resvg(source, {
    fitTo: { mode: "width", value: width },
  }).render();
  await writeFile(`${folder}${name}.png`, rendered.asPng());
}
await writeFile(`${folder}mjlum-mark.svg`, mahjongMark);
await writeFile(`${folder}mjlum-icon.svg`, icon);
console.log("Generated MJLum icon, splash, adaptive icon and favicon.");
