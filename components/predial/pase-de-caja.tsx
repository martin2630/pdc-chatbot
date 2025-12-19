import React from "react";

import { PdfPreview } from "./pdf-preview";

interface Props {
  pdfBase64: string;
  fileName: string;
  onDescargarPaseCaja: ({
    pdfBase64,
    fileName,
  }: {
    pdfBase64: string;
    fileName: string;
  }) => void;
}

const PaseDeCaja = ({ pdfBase64, fileName, onDescargarPaseCaja }: Props) => {
  const handleDescargarPaseCaja = () => {
    onDescargarPaseCaja({
      pdfBase64,
      fileName,
    });
  };

  return (
    <>
      {pdfBase64 ? (
        <PdfPreview
          pdfBase64={pdfBase64}
          fileName={fileName || "pase_caja.pdf"}
        />
      ) : (
        <div className="flex flex-col gap-3 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Pase de caja generado
              </h3>
              <p className="text-xs text-zinc-500">
                {fileName || "pase_caja.pdf"}
              </p>
            </div>
          </div>
          {pdfBase64 && (
            <button
              onClick={handleDescargarPaseCaja}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm hover:shadow-md"
            >
              Descargar pase de caja
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default PaseDeCaja;
