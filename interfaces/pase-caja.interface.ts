import { number } from "zod/v4";

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
  codeReference?: string;
  fileName?: string;
  pdfUrl?: string;
}

export interface PaseCajaResumen {
  grupoTramiteId: Number;
  tramiteId: Number;
  solicitudId: Number;
  solicitudEstado: String;
  solicitudDescripcion: String;
  solicitudFecha: String;
  solicitudCantidad: Number;
  solicitudVencimientoFecha: String;
  solicitudUsuario: String;
  solicitudObservaciones: String;
  conceptos: PaseCajaConcepto[];
  total: Number;
  codeReference?: string;
  fileName?: string;
  pdfUrl?: string;
  // solicitudRedondear: String;
  // cvePersona: Number;
  // solicitudPadronId: Number;
  // solicitudTipoIngreso: String;
  // solicitudHora: String;
  // solicitudIp: String;
  // SolicitudCveTerapeuta: Number;
  // solicitudNoExpediente: String;
  // solicitudArticulo: String;
  // solicitudProyectoBanco: Number;
  // solicitudURLPago: String;
  // solicitudReciboSerie: String;
  // solicitudReciboFolio: Number;
}
