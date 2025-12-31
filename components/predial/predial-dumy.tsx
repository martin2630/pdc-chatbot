interface Props {
  part?: any;
  onGeneratePaseDeCaja: (codeReference: string) => void;
  onhandlePagarEnLinea: (codeReference: string) => void;
}

const PredialDummy = ({
  part,
  onGeneratePaseDeCaja,
  onhandlePagarEnLinea,
}: Props) => {
  return (
    <div className="flex flex-col gap-3 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Código de referencia:
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Código:</span>
            <code className="px-2 py-1 text-xs font-mono font-semibold text-gray-600 dark:text-white bg-red-50 dark:bg-white/20 rounded border border-primary dark:border-white">
              {part?.output?.codeReference}
            </code>
          </div>
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Monto a pagar:
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Total:</span>
            <code className="px-2 py-1 text-xs font-mono font-semibold text-gray-600 dark:text-white bg-red-50 dark:bg-white/20 rounded border border-primary dark:border-white">
              {`$${
                part?.output?.total
                  ? part?.output?.total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : 0
              }`}
            </code>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
        {/* <button
          onClick={() => onhandlePagarEnLinea(part?.output?.codeReference)}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          Consultar estado de cuenta
        </button> */}
        {part?.output?.solicitudEstado === "PP" && (
          <>
            <button
              onClick={() => onGeneratePaseDeCaja(part?.output?.codeReference)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-md transition-colors shadow-sm hover:shadow-md bg-primary"
            >
              Generar pase de caja
            </button>
            <button
              onClick={() => onhandlePagarEnLinea(part?.output?.codeReference)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-primary dark:border-primary rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Pagar en línea
            </button>
          </>
        )}
        {part?.output?.solicitudEstado === "P" && (
          <p>No tienes pagos pendientes.</p>
        )}
      </div>
    </div>
  );
};

export default PredialDummy;
