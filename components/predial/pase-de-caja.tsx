import React from "react";

import { PdfPreview } from "./pdf-preview";

interface Props {
  pdfUrl: string;
}

const PaseDeCaja = ({ pdfUrl }: Props) => {
  return (
    <>
      {pdfUrl ? (
        <PdfPreview pdfUrl={pdfUrl} />
      ) : (
        <div className="flex flex-col gap-3 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Pase de caja generado
              </h3>
              <p className="text-xs text-zinc-500">{"pase_caja.pdf"}</p>
            </div>
          </div>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm hover:shadow-md"
            >
              Descargar pase de caja
            </a>
          )}
        </div>
      )}
    </>
  );
};

export default PaseDeCaja;
