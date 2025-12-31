"use client";

import { useState } from "react";

interface PdfPreviewProps {
  pdfUrl: string;
}

export const PdfPreview = ({ pdfUrl }: PdfPreviewProps) => {
  const fileName = "pase_caja.pdf";

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
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center px-4 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors shadow-sm hover:shadow-md"
          >
            Abrir
          </a>
        </div>
      </div>
    </div>
  );
};
