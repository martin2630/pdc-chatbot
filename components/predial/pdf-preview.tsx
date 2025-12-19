"use client";

import { useState } from "react";

interface PdfPreviewProps {
  pdfBase64: string;
  fileName?: string;
}

export const PdfPreview = ({
  pdfBase64,
  fileName = "documento.pdf",
}: PdfPreviewProps) => {
  // Convertir base64 a data URL para el iframe
  const pdfDataUrl = `data:application/pdf;base64,${pdfBase64}`;

  const handleDownload = () => {
    // 1️⃣ Base64 → bytes
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    // 2️⃣ Bytes → Blob PDF
    const pdfBlob = new Blob([byteArray], {
      type: "application/pdf",
    });

    // 3️⃣ Descargar
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(pdfUrl);
  };

  const handleOpenInNewTab = () => {
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const pdfBlob = new Blob([byteArray], {
      type: "application/pdf",
    });

    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="flex flex-col gap-3 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {fileName}
          </h3>
          <p className="text-xs text-zinc-500">Pase de caja generado</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleOpenInNewTab}
            className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            Abrir
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Descargar
          </button>
        </div>
      </div>
    </div>
  );
};

