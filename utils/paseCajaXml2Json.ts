import { XMLParser } from "fast-xml-parser";

export const paseCajaXml2Json = (xmlSoap: string) => {
  const options = {
    ignoreAttributes: false,
    ignoreNameSpace: false, // Preservar los namespaces para poder buscarlos
    parseTagValue: true, // Convierte automáticamente "576.00" a número
    trimValues: true,
    parseTrueNumberOnly: false,
  };

  const parser = new XMLParser(options);

  try {
    // 1. Parsear el sobre SOAP
    const soapObj = parser.parse(xmlSoap);

    // 2. Intentar diferentes variantes de namespace para el Envelope
    const envelope = soapObj["SOAP-ENV:Envelope"] || soapObj.Envelope;

    if (!envelope) {
      console.error(
        "No se encontró el elemento Envelope en el XML. Claves disponibles:",
        Object.keys(soapObj)
      );
      return null;
    }

    // 3. Intentar diferentes variantes para el Body
    const body = envelope["SOAP-ENV:Body"] || envelope.Body;

    if (!body) {
      console.error(
        "No se encontró el elemento Body en el Envelope. Claves disponibles:",
        Object.keys(envelope)
      );
      return null;
    }

    // 4. Buscar la respuesta ExecuteResponse
    const executeResponse =
      body["WSConsultaPasesCaja.ExecuteResponse"] || body.ExecuteResponse;

    if (!executeResponse) {
      console.error(
        "No se encontró ExecuteResponse. Claves disponibles:",
        Object.keys(body)
      );
      return null;
    }

    // 5. Extraer el XML interno que viene "atrapado" como texto
    const innerXmlStr = executeResponse.Datospasescajaretornados;

    if (!innerXmlStr) {
      console.error(
        "No se encontró Datospasescajaretornados. Claves disponibles:",
        Object.keys(executeResponse)
      );
      return null;
    }

    // 6. Parsear el XML interno (ConsultaPasesCaja)
    const dataObj = parser.parse(innerXmlStr);

    const item =
      dataObj.ConsultaPasesCaja?.["ConsultaPasesCaja.ConsultaPasesCajaItem"];

    if (!item) {
      console.error(
        "No se encontró ConsultaPasesCajaItem. Estructura:",
        JSON.stringify(dataObj, null, 2)
      );
      return null;
    }

    // 7. Normalizar los conceptos (Fuentes)
    // Nota: fast-xml-parser crea un objeto si es 1 solo, o un array si son varios.
    const fuentesRaw =
      item?.["Fuentescolns:Fuentes"][
        "ConsultaPasesCaja.ConsultaPasesCajaItem.Fuente"
      ];

    const conceptos = fuentesRaw
      ? Array.isArray(fuentesRaw)
        ? fuentesRaw
        : [fuentesRaw]
      : [];

    // 8. Mapear conceptos y convertir importes a números
    const conceptosMapeados = conceptos.map((f) => {
      const importe = f.ConceptoImporte ? Number(f.ConceptoImporte) || 0 : 0;
      return {
        concepto: f.Concepto,
        nombre: f.ConceptoNombre,
        importe,
      };
    });

    // 9. Calcular el total usando el array mapeado
    const total = conceptosMapeados.reduce((acc, c) => {
      const importe =
        typeof c.importe === "number" && !isNaN(c.importe) ? c.importe : 0;
      return acc + importe;
    }, 0);

    // 10. Retornar un JSON limpio y amigable
    return {
      grupoTramiteId: item.GrupoTramiteId,
      tramiteId: item.TramiteId,
      solicitudId: item.SolicitudId,
      solicitudEstado: item.SolicitudEstado,
      solicitudDescripcion: item.SolicitudDescripcion,
      solicitudFecha: item.SolicitudFecha,
      solicitudCantidad: item.SolicitudCantidad,
      solicitudRedondear: item.SolicitudRedondear,
      cvePersona: item.CvePersona,
      solicitudVencimientoFecha: item.SolicitudVencimientoFecha,
      solicitudUsuario: item.SolicitudUsuario,
      solicitudObservaciones: item.SolicitudObservaciones,
      solicitudPadronId: item.SolicitudPadronId,
      solicitudTipoIngreso: item.SolicitudTipoIngreso,
      solicitudHora: item.SolicitudHora,
      solicitudIp: item.SolicitudIp,
      SolicitudCveTerapeuta: item.SolicitudCveTerapeuta,
      solicitudNoExpediente: item.SolicitudNoExpediente,
      solicitudArticulo: item.SolicitudArticulo,
      solicitudProyectoBanco: item.SolicitudProyectoBanco,
      solicitudURLPago: item.SolicitudURLPago,
      solicitudReciboSerie: item.SolicitudReciboSerie,
      solicitudReciboFolio: item.SolicitudReciboFolio,
      conceptos: conceptosMapeados,
      total,
    };
  } catch (error) {
    console.error("Error parseando el XML:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    return null;
  }
};
