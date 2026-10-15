import type { DemoSettings } from "./demo-settings";
import { demoLink } from "./demo-share";

export type ExportItem = {
  name: string;
  category: string;
  price: number;
  unit?: string;
  available: boolean;
  allergens: string[];
};
export const demoFilename = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "il-tuo-locale";
export function qrLink(
  location: string,
  settings: DemoSettings,
  includeMenu: boolean,
) {
  const link = demoLink(
    location,
    includeMenu ? settings : { ...settings, items: {} },
  );
  if (new TextEncoder().encode(link).length > 1800)
    throw new Error(
      "Troppe modifiche per un QR leggibile. Disattiva ‘Includi prezzi e disponibilità’ oppure usa il link condivisibile.",
    );
  return link;
}
function saveURL(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  saveURL(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
async function qrData(link: string) {
  const QRCode = await import("qrcode");
  return QRCode.toDataURL(link, {
    errorCorrectionLevel: "M",
    margin: 4,
    width: 720,
    color: { dark: "#182b42", light: "#ffffff" },
  });
}
export async function exportQR(name: string, link: string) {
  const data = await qrData(link);
  const image = new Image();
  image.src = data;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 840;
  canvas.height = 960;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Il browser non supporta il disegno del QR.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 840, 960);
  ctx.fillStyle = "#182b42";
  ctx.textAlign = "center";
  ctx.font = "bold 30px sans-serif";
  ctx.fillText(name, 420, 55, 760);
  ctx.drawImage(image, 60, 85, 720, 720);
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("DEMO · NESSUN ORDINE REALE", 420, 850);
  ctx.font = "22px sans-serif";
  ctx.fillText("Scansiona per provare il sito", 420, 893);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Impossibile generare il file QR.");
  saveBlob(blob, `${demoFilename(name)}-qr-demo.png`);
}
// Built-in PDF fonts cover Italian; omit unsupported symbols rather than corrupt text.
export const pdfText = (text: string) =>
  text.replace(/[^\u0020-\u00ff\u20ac\n]/gu, "").trim();
export async function exportMenu(
  name: string,
  items: ExportItem[],
  link: string,
) {
  if (!items.length)
    throw new Error("Attendi il caricamento del menu e riprova.");
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  pdf.setProperties({
    title: `${pdfText(name)} - Menu dimostrativo`,
    subject: "Demo: nessun ordine reale",
  });
  let y = 24;
  function header() {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(19);
    pdf.setTextColor(24, 43, 66);
    const lines = pdf.splitTextToSize(pdfText(name), 174);
    pdf.text(lines, 18, 20);
    y = 24 + lines.length * 7;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Menu dimostrativo - prezzi e disponibilita di esempio", 18, y);
    y += 12;
  }
  function ensure(height: number) {
    if (y + height > 270) {
      pdf.addPage();
      header();
    }
  }
  header();
  const categories = [...new Set(items.map((item) => item.category))];
  for (const category of categories) {
    ensure(40);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(pdfText(category), 18, y);
    y += 8;
    for (const item of items.filter((item) => item.category === category)) {
      const title = pdf.splitTextToSize(
        pdfText(item.name) + (item.available ? "" : " (esaurito)"),
        130,
      );
      const details = [
        item.unit,
        item.allergens.length
          ? `Allergeni dichiarati: ${item.allergens.join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join(". ");
      const lines = details ? pdf.splitTextToSize(pdfText(details), 170) : [];
      ensure(title.length * 6 + lines.length * 4 + 6);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(title, 18, y);
      pdf.text(
        `${Number(item.price).toFixed(2).replace(".", ",")} EUR`,
        192,
        y,
        { align: "right" },
      );
      y += title.length * 6;
      if (lines.length) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(lines, 18, y);
        y += lines.length * 4;
      }
      y += 5;
    }
    y += 4;
  }
  ensure(22);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    "Per allergie o intolleranze, confrontarsi con il locale nel sito reale.",
    18,
    y,
  );
  y += 7;
  pdf.textWithLink("Apri l'anteprima dimostrativa", 18, y, { url: link });
  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(24, 43, 66);
    pdf.text("DEMO - Nessun ordine o pagamento reale", 18, 285);
    pdf.text(`${page} / ${pages}`, 192, 285, { align: "right" });
  }
  pdf.save(`${demoFilename(name)}-menu-demo.pdf`);
}
export async function exportHero(name: string) {
  const hero = document.querySelector<HTMLElement>("[data-demo-hero]");
  if (!hero)
    throw new Error("Torna alla pagina iniziale per esportare la copertina.");
  const { toPng } = await import("html-to-image");
  await document.fonts.ready;
  const data = await toPng(hero, {
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    skipFonts: true,
    backgroundColor: "#fffaf3",
    style: { transform: "none" },
  });
  const image = new Image();
  image.src = data;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height + 64;
  const ctx = canvas.getContext("2d");
  if (!ctx)
    throw new Error("Il browser non supporta l'esportazione dell'immagine.");
  ctx.drawImage(image, 0, 0);
  ctx.fillStyle = "#182b42";
  ctx.fillRect(0, image.height, canvas.width, 64);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "DEMO · Nessun ordine reale",
    canvas.width / 2,
    image.height + 40,
    canvas.width - 24,
  );
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob)
    throw new Error(
      "Esportazione non riuscita. Riprova dopo aver caricato le immagini.",
    );
  saveBlob(blob, `${demoFilename(name)}-copertina-demo.png`);
}
