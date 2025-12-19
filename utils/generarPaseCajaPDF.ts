import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

export async function generarPaseCajaPDF(data: any) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const draw = (
    text: string,
    x: number,
    y: number,
    size = 9,
    isBold = false,
    align: "left" | "right" = "left",
    width = 0
  ) => {
    const usedFont = isBold ? bold : font;
    let drawX = x;

    if (align === "right" && width) {
      const textWidth = usedFont.widthOfTextAtSize(text, size);
      drawX = x + width - textWidth;
    }

    page.drawText(text ?? "", {
      x: drawX,
      y,
      size,
      font: usedFont,
      color: rgb(0, 0, 0),
    });
  };

  // =========================
  // ENCABEZADO
  // =========================
  draw(
    `${String(data.grupoTramiteId)}-${String(data.tramiteId)}-${String(
      data.solicitudId
    )}`,
    50,
    760,
    12,
    true
  );

  draw(data.solicitudDescripcion, 50, 742, 9);

  // =========================
  // CONTRIBUYENTE
  // =========================
  draw("Nombre:", 50, 710, 9, true);
  draw(data.solicitudObservaciones?.split(",")[0], 120, 710);

  draw("Dirección:", 50, 695, 9, true);
  draw(data.solicitudObservaciones?.slice(0, 90), 120, 695);

  // =========================
  // BLOQUE INSTITUCIONAL
  // =========================
  draw("PRESIDENCIA MUNICIPAL", 50, 655, 9, true);
  draw("TESORERÍA MUNICIPAL", 50, 642, 9, true);
  draw("MUNICIPIO DE PLAYA DEL CARMEN", 50, 629, 9, true);

  // =========================
  // DATOS DEL TRÁMITE
  // =========================
  draw("Fecha:", 50, 600, 9, true);
  draw(data.solicitudFecha, 120, 600);

  draw("Folio:", 50, 585, 9, true);
  draw(String(data.solicitudId), 120, 585);

  draw("Fecha de vencimiento:", 300, 600, 9, true);
  draw(data.solicitudVencimientoFecha, 450, 600);

  draw("Usuario:", 300, 585, 9, true);
  draw(data.solicitudUsuario, 450, 585);

  // =========================
  // TABLA HEADER
  // =========================
  draw("Concepto", 50, 540, 9, true);
  draw("Descripción", 130, 540, 9, true);
  draw("Importe", 480, 540, 9, true);

  page.drawLine({
    start: { x: 50, y: 535 },
    end: { x: 560, y: 535 },
  });

  // =========================
  // TABLA BODY
  // =========================
  let y = 520;

  data.conceptos.forEach((c: any) => {
    draw(String(c.concepto), 50, y);
    draw(c.nombre, 130, y, 9);
    draw(`$ ${c.importe.toFixed(2)}`, 450, y, 9, false, "right", 100);
    y -= 14;
  });

  // =========================
  // TOTAL
  // =========================
  page.drawLine({
    start: { x: 380, y: y - 5 },
    end: { x: 560, y: y - 5 },
  });

  draw("TOTAL", 380, y - 22, 11, true);
  draw(`$ ${data.total.toFixed(2)}`, 450, y - 22, 11, true, "right", 100);

  // =========================
  // OBSERVACIONES
  // =========================
  draw("Nota:", 50, 120, 8, true);
  draw(
    "Verifique que los datos contenidos en esta hoja sean correctos antes de realizar su pago.",
    50,
    105,
    8
  );

  // =========================
  // LÍNEA DE CAPTURA
  // =========================
  const linea = `${String(data.grupoTramiteId)}${String(
    data.tramiteId
  )}${String(data.solicitudId)}`.padEnd(28, " ");

  draw(`${linea}   $ ${data.total.toFixed(2)}`, 50, 70, 10, true);

  const bytes = await pdf.save();
  return Buffer.from(bytes).toString("base64");
}
