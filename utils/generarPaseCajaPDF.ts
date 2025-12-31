import fs from "fs";
import path from "path";

import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_BOTTOM = 50;
const LINEA_CAPTURA = "4218 0303 9136 4463 2211";

export async function generarPaseCajaPDF(data: any) {
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let currentY = PAGE_HEIGHT - 50;
  let pageNumber = 1;

  const CONTENT_WIDTH = 512;

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // =========================
  // LOGO
  // =========================

  const logoPDC = await pdf.embedPng(
    fs.readFileSync(path.join(process.cwd(), "public/images/logo-pdc.png"))
  );

  // Cargar logos de bancos
  const logoSantander = await pdf.embedPng(
    fs.readFileSync(
      path.join(process.cwd(), "public/images/santander-logo.jpg")
    )
  );
  const logoHSBC = await pdf.embedPng(
    fs.readFileSync(path.join(process.cwd(), "public/images/hsbc-logo.jpg"))
  );
  const logoBanamex = await pdf.embedPng(
    fs.readFileSync(path.join(process.cwd(), "public/images/banamex-logo.jpg"))
  );
  const logoBBVA = await pdf.embedPng(
    fs.readFileSync(path.join(process.cwd(), "public/images/bbva-logo.jpg"))
  );
  const logoScotiabank = await pdf.embedPng(
    fs.readFileSync(
      path.join(process.cwd(), "public/images/scotiabank-logo.jpg")
    )
  );

  const scale = 100 / logoPDC.width;

  const logoScaled = {
    width: 100,
    height: logoPDC.height * scale,
  };

  // =========================
  // NUEVA PÁGINA
  // =========================
  const newPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    currentY = PAGE_HEIGHT - 50;
    pageNumber++;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (currentY - neededHeight < MARGIN_BOTTOM) {
      newPage();
    }
  };

  // =========================
  // DRAW (una sola línea)
  // =========================
  const draw = (
    text: string,
    x: number,
    y: number,
    size = 9,
    isBold = false,
    align: "left" | "right" | "center" = "left",
    width = 0
  ) => {
    const usedFont = isBold ? bold : font;
    let drawX = x;

    const safeText = text ?? "";
    const textWidth = usedFont.widthOfTextAtSize(safeText, size);

    if (align === "right" && width) drawX = x + width - textWidth;
    if (align === "center") drawX = x - textWidth / 2;

    page.drawText(safeText, {
      x: drawX,
      y,
      size,
      font: usedFont,
      color: rgb(0, 0, 0),
    });
  };

  // =========================
  // WRAP TEXT
  // =========================
  const wrapText = (
    text: string,
    maxWidth: number,
    usedFont: PDFFont,
    fontSize: number
  ): string[] => {
    const words = (text ?? "").split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = usedFont.widthOfTextAtSize(testLine, fontSize);

      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // =========================
  // DRAW PARAGRAPH (REAL FLOW)
  // =========================
  const drawParagraph = (
    text: string,
    x: number,
    maxWidth: number,
    size = 9,
    isBold = false,
    lineHeight = size + 4,
    isUnderlined = false,
    align: "left" | "center" | "right" = "left"
  ): number => {
    const usedFont = isBold ? bold : font;
    const lines = wrapText(text, maxWidth, usedFont, size);

    lines.forEach((line) => {
      checkPageBreak(lineHeight);

      const textWidth = usedFont.widthOfTextAtSize(line, size);

      let drawX = x;

      if (align === "center") {
        drawX = x + (maxWidth - textWidth) / 2;
      }

      if (align === "right") {
        drawX = x + maxWidth - textWidth;
      }

      // texto
      draw(line, drawX, currentY, size, isBold);

      // subrayado (si aplica)
      if (isUnderlined) {
        page.drawLine({
          start: { x: drawX, y: currentY - 1.5 },
          end: { x: drawX + textWidth, y: currentY - 1.5 },
          thickness: 0.5,
          color: rgb(0, 0, 0),
        });
      }

      currentY -= lineHeight;
    });

    return currentY;
  };

  const centerX = PAGE_WIDTH / 2;

  // =========================
  // LOGO
  // =========================
  const logoX = 482; // posición horizontal (ajusta a tu gusto)
  page.drawImage(logoPDC, {
    x: logoX,
    y: currentY - 50,
    width: logoScaled.width,
    height: logoScaled.height,
  });

  // =========================
  // BLOQUE INSTITUCIONAL
  // =========================
  draw("MUNICIPIO DE PLAYA DEL CARMEN", centerX, currentY, 11, true, "center");
  currentY -= 14;
  draw("TESORERIA MUNICIPAL", centerX, currentY, 11, true, "center");
  currentY -= 14;
  draw("PRESIDENCIA MUNICIPAL", centerX, currentY, 11, false, "center");

  // =========================
  // FOLIO
  // =========================
  currentY -= 36;
  draw(`Folio: `, 50, currentY, 9, true);
  const folioWidth = font.widthOfTextAtSize(`Folio: `, 9);
  draw(
    `${data.grupoTramiteId}-${data.tramiteId}-${data.solicitudId}`,
    50 + folioWidth + 5,
    currentY,
    9,
    false
  );

  // =========================
  // FECHAS
  // =========================
  draw("Fecha:", 464, currentY, 9, true);
  const fechaWidth = font.widthOfTextAtSize("Fecha:", 9);
  draw(String(data.solicitudFecha), 464 + fechaWidth + 5, currentY, 9);

  // =========================
  // FECHA DE VENCIMIENTO
  // =========================
  currentY -= 12;
  draw("Fecha de vencimiento:", 50, currentY, 9, true);
  const fechaVencimientoWidth = font.widthOfTextAtSize(
    "Fecha de vencimiento: ",
    9
  );
  draw(
    String(data.solicitudVencimientoFecha),
    50 + fechaVencimientoWidth + 5,
    currentY,
    9
  );

  // =========================
  // PAGINA
  // =========================
  draw("Página: ", 464, currentY, 9, true);
  const paginaWidth = font.widthOfTextAtSize("Página: ", 9);
  draw(String(pageNumber), 464 + paginaWidth + 5, currentY, 9);

  // =========================
  // USUARIO
  // =========================
  currentY -= 12;
  draw("Usuario: ", 464, currentY, 9, true);
  const usuarioWidth = font.widthOfTextAtSize("Usuario: ", 9);
  draw(String(data.solicitudUsuario), 464 + usuarioWidth + 5, currentY, 9);

  // =========================
  // NOMBRE
  // =========================
  currentY -= 24;
  draw("Nombre:", 50, currentY, 9, true);
  const nombreWidth = font.widthOfTextAtSize("Nombre: ", 9);
  draw("", 50 + nombreWidth + 5, currentY, 9, true);

  // =========================
  // DIRECCIÓN
  // =========================
  currentY -= 12;
  draw("Dirección: ", 50, currentY, 9, true);
  const addressWidth = font.widthOfTextAtSize("Dirección: ", 9);
  draw("", 50 + addressWidth + 5, currentY, 9, false);

  // =========================
  // UBICACIÓN
  // =========================
  currentY -= 12;
  draw("Ubicación: ", 50, currentY, 9, true);
  const locationWidth = font.widthOfTextAtSize("Ubicación: ", 9);
  draw("", 50 + locationWidth + 5, currentY, 9, true);

  // =========================
  // CONCEPTO (MULTILÍNEA REAL)
  // =========================
  currentY -= 12;
  draw("Concepto: ", 50, currentY, 9, true);
  const conceptWidth = font.widthOfTextAtSize("Concepto: ", 9);
  currentY = currentY;
  currentY = drawParagraph(
    data.solicitudDescripcion,
    50 + conceptWidth + 5,
    CONTENT_WIDTH,
    9,
    false
  );

  currentY -= 36;
  // =========================
  // TABLA HEADER
  // =========================
  draw("Concepto", 50, currentY, 9, true);
  draw("Descripción", 130, currentY, 9, true);
  draw("Importe", 480, currentY, 9, true);

  currentY -= 14;
  page.drawLine({
    start: { x: 50, y: currentY },
    end: { x: 560, y: currentY },
  });

  // =========================
  // TABLA BODY
  // =========================
  currentY -= 18;
  data.conceptos.forEach((c: any) => {
    if (currentY < MARGIN_BOTTOM) {
      newPage();
    }

    draw(String(c.concepto), 50, currentY);
    draw(c.nombre, 130, currentY);
    draw(`$ ${c.importe.toFixed(2)}`, 450, currentY, 9, false, "right", 100);
    currentY -= 14;
  });

  // =========================
  // TOTAL
  // =========================
  currentY -= 14;
  draw("Usuario (Impresión)", 50, currentY, 9, true);
  draw("Total", 410, currentY, 9, true);
  draw(
    `$ ${data.total.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    450,
    currentY,
    9,
    true,
    "right",
    100
  );

  // =========================
  // OBSERVACIONES
  // =========================
  currentY -= 24;
  currentY = drawParagraph(
    String(data.solicitudObservaciones),
    70,
    CONTENT_WIDTH,
    9,
    false
  );

  // =========================
  // NOTA
  // =========================
  currentY -= 36;
  currentY = drawParagraph(
    "Nota: verifique que los datos contenidos en esta hoja sean correctos antes de realizar su pago, del trámite correspondiente",
    50,
    CONTENT_WIDTH,
    9,
    false
  );

  // =========================
  // LÍNEA
  // =========================
  currentY -= 5;
  page.drawLine({
    start: { x: 50, y: currentY },
    end: { x: 560, y: currentY },
  });

  currentY -= 18;
  draw("LINEA DE CAPTURA", 50, currentY, 11, true);
  const lineaCapturaTextWidth = font.widthOfTextAtSize("LINEA DE CAPTURA", 11);
  draw(LINEA_CAPTURA, 50 + lineaCapturaTextWidth + 10, currentY, 11, true);
  const lineaCapturaNumbersWidth = font.widthOfTextAtSize(LINEA_CAPTURA, 11);
  draw(
    `$ ${data.total.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    50 + lineaCapturaTextWidth + 10 + lineaCapturaNumbersWidth + 10,
    currentY,
    11,
    true
  );

  // =========================
  // SECCIÓN DE BANCOS
  // =========================
  currentY -= 50;
  const col1 = 50;
  const col2 = 300;
  const bankLogoWidth = 60;
  const bankLogoHeight = 25;

  // --- FILA 1: Santander y Banamex ---
  page.drawImage(logoSantander, {
    x: col1,
    y: currentY,
    width: bankLogoWidth,
    height: bankLogoHeight,
  });
  draw("Convenio 8917", col1 + bankLogoWidth + 5, currentY + 8, 9, false);

  page.drawImage(logoBanamex, {
    x: col2,
    y: currentY,
    width: bankLogoWidth,
    height: bankLogoHeight,
  });
  draw("Convenio 309401", col2 + bankLogoWidth + 5, currentY + 8, 9, false);

  // --- FILA 2: HSBC y Scotiabank ---
  currentY -= 40;
  page.drawImage(logoHSBC, {
    x: col1,
    y: currentY,
    width: bankLogoWidth,
    height: bankLogoHeight,
  });
  draw("Convenio 1405", col1 + bankLogoWidth + 5, currentY + 14, 8, true);
  draw(
    "Cuenta CLABE: 021180550300014051",
    col1 + bankLogoWidth + 5,
    currentY + 4,
    7,
    false
  );

  page.drawImage(logoScotiabank, {
    x: col2,
    y: currentY,
    width: bankLogoWidth,
    height: bankLogoHeight,
  });
  draw("Convenio 2695", col2 + bankLogoWidth + 5, currentY + 8, 9, false);

  // --- FILA 3: BBVA ---
  currentY -= 40;
  page.drawImage(logoBBVA, {
    x: col1,
    y: currentY,
    width: bankLogoWidth,
    height: bankLogoHeight,
  });
  draw("Convenio 01340093", col1 + bankLogoWidth + 5, currentY + 14, 8, true);
  draw(
    "Cuenta CLABE: 012914002013400931",
    col1 + bankLogoWidth + 5,
    currentY + 4,
    7,
    false
  );

  currentY -= 24; // Espacio antes del siguiente bloque de texto

  currentY = drawParagraph(
    "Nota: los pagos realizados a la cuenta clabe (SPEI referenciado) deberán de tener como referencia de pago la linea de captura de 20 digitos (sin espacios). Se reciben cheques certificados o cheques de caja; Beneficiario MUNICIPIO DE PLAYA DEL CARMEN",
    50,
    CONTENT_WIDTH,
    9,
    true
  );

  currentY -= 5;
  currentY = drawParagraph(
    "Importante: Al realizar su pago a través de convenios o cuenta CLABE, deberá acudir a la Dirección de ingresos para obtener su recibo oficial 48 horas posterior al pago. ",
    50,
    CONTENT_WIDTH,
    8,
    false,
    9 + 4,
    true
  );

  // ================================================
  // FILA 1
  // ================================================

  currentY -= 12;
  draw(
    "* Tesoraria Municipal(Primer piso Av 20 Nte. Entre 8 y 10 Col. centro).",
    50,
    currentY,
    7,
    true
  );

  draw(
    "* Alcaldía Puerto Aventuras(Calle Xia entre Chechén y Caracolito).",
    centerX,
    currentY,
    7,
    true
  );

  // ================================================
  // FILA 2
  // ================================================

  currentY -= 12;
  draw(
    "• Desarrollo Agrropecuario (1ra Suer con Calle 20 Col. Centro).",
    50,
    currentY,
    7,
    true
  );

  draw(
    "• Instituro de la Mujer(Av. Sur esquina Av. Laak 4to parque, Villas del Sol).",
    centerX,
    currentY,
    7,
    true
  );

  // ================================================
  // FILA 3
  // ================================================

  currentY -= 12;
  draw(
    "• Registro Civil(Av. C.T.M. entre 115 y 120 Av. Palacio Nuevo).",
    50,
    currentY,
    7,
    true
  );
  draw(
    "• Direccion de Transito Municipal(Av. 115 entre Av. Mayapan y Calle Caoba).",
    centerX,
    currentY,
    7,
    true
  );

  // ================================================
  // FILA 4
  // ================================================
  currentY -= 12;
  draw(
    "• Ingresos (Av. C.T.M. entre 115 y 120 Av. Palacio Nuevo).",
    50,
    currentY,
    7,
    true
  );

  draw(
    "• Direccion de Protección Civil(Av. Tecnológico entre Calle Cedro y Chemuyil Villamar II).",
    centerX,
    currentY,
    7,
    true
  );

  // ================================================
  // FILA 5
  // ================================================
  currentY -= 12;
  draw(
    "• Fiscalización (Av. C.T.M. entre 115 y 120 Av. Palacio Nuevo)",
    50,
    currentY,
    7,
    true
  );

  currentY -= 36;
  currentY = drawParagraph(
    "FAVOR DE VERIFICAR SUS DATOS FISCALES ANTES DE REALIZAR SU PAGO",
    50,
    CONTENT_WIDTH,
    18,
    true,
    22, //lineHeight,
    false,
    "center"
  );

  currentY -= 5;
  currentY = drawParagraph(
    `"Todas las operaciones NO auto-facturadas posterior al cierre mensual, se emitirá factura a nombre de público en general"`,
    50,
    CONTENT_WIDTH,
    12,
    false,
    16, //lineHeight,
    false,
    "center"
  );

  const bytes = await pdf.save();
  return Buffer.from(bytes).toString("base64");
}
