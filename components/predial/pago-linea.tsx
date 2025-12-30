import React from "react";

const PagoLinea = ({ part }: { part: any }) => {
  console.log("part", part);
  return (
    <>
      {part?.codigoError === 200 && (
        <div className="flex flex-col gap-3 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Link de pago generado exitosamente
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Haz clic en el botón para continuar con el pago en línea
              </p>
              {part?.urlIntencionCobro && (
                <a
                  href={part?.urlIntencionCobro}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors shadow-sm hover:shadow-md"
                >
                  Continuar con el pago
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PagoLinea;
