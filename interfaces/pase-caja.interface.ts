export interface PaseCajaConcepto {
  concepto: string;
  nombre: string;
  importe: number;
}

export interface PaseCaja {
  grupoTramiteId: number;
  tramiteId: number;
  solicitudId: number;
  solicitudEstado: string;
  solicitudDescripcion: string;
  solicitudFecha: string;
  solicitudCantidad: number;
  solicitudRedondear: number;
  cvePersona: string;
  solicitudVencimientoFecha: string;
  solicitudUsuario: string;
  solicitudObservaciones: string;
  solicitudPadronId: number;
  solicitudTipoIngreso: string;
  solicitudHora: string;
  solicitudIp: string;
  SolicitudCveTerapeuta: string;
  solicitudNoExpediente: string;
  solicitudArticulo: string;
  solicitudProyectoBanco: string;
  solicitudURLPago: string;
  solicitudReciboSerie: string;
  solicitudReciboFolio: string;
  conceptos: PaseCajaConcepto[];
  total: number;
}
