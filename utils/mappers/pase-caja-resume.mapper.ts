import { PaseCaja, PaseCajaResumen } from "@/interfaces/pase-caja.interface";

export function paseCajaResumenMapper(paseCajaData: PaseCaja): PaseCajaResumen {
  return {
    grupoTramiteId: paseCajaData?.grupoTramiteId,
    tramiteId: paseCajaData?.tramiteId,
    solicitudId: paseCajaData?.solicitudId,
    solicitudEstado: paseCajaData?.solicitudEstado,
    solicitudDescripcion: paseCajaData?.solicitudDescripcion,
    solicitudFecha: paseCajaData?.solicitudFecha,
    solicitudCantidad: paseCajaData?.solicitudCantidad,
    solicitudVencimientoFecha: paseCajaData?.solicitudVencimientoFecha,
    solicitudUsuario: paseCajaData?.solicitudUsuario,
    solicitudObservaciones: paseCajaData?.solicitudObservaciones,
    conceptos: paseCajaData?.conceptos,
    total: paseCajaData?.total,
    codeReference: paseCajaData?.codeReference,
    fileName: paseCajaData?.fileName,
    pdfUrl: paseCajaData?.pdfUrl,
  };
}
