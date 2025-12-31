import { XMLParser } from "fast-xml-parser";

export const pagoenLineaXml2Json = (xmlSoap: string) => {
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
    const envelope = soapObj["s:Envelope"] || soapObj.Envelope;

    if (!envelope) {
      console.error(
        "No se encontró el elemento Envelope en el XML. Claves disponibles:",
        Object.keys(soapObj)
      );
      return null;
    }

    // 3. Intentar diferentes variantes para el Body
    const body = envelope["s:Body"] || envelope.Body;

    if (!body) {
      console.error(
        "No se encontró el elemento Body en el Envelope. Claves disponibles:",
        Object.keys(envelope)
      );
      return null;
    }

    // 4. Buscar la respuesta ExecuteResponse
    const executeResponse =
      body["daoGeneraIntenciondecobroGlobalResponse"] || body.ExecuteResponse;

    if (!executeResponse) {
      console.error(
        "No se encontró ExecuteResponse. Claves disponibles:",
        Object.keys(body)
      );
      return null;
    }

    // 5. Extraer el XML interno que viene "atrapado" como texto
    const item = executeResponse["daoGeneraIntenciondecobroGlobalResult"];

    if (!item) {
      console.error(
        "No se encontró daoGeneraIntenciondecobroGlobalResult. Claves disponibles:",
        Object.keys(executeResponse)
      );
      return null;
    }

    // Extraer valores
    const codigoError = item["a:CodigoError"] ?? 0;
    const mensajeError = item["a:MensajeError"] ?? null;
    const folioPaseCaja = item["a:FolioPaseCaja"];
    const grupoTramiteId = item["a:GrupoTramiteId"] ?? 0;
    const padronId = item["a:PadronId"];
    const solicitudId = item["a:SolicitudId"] ?? 0;
    const tramiteId = item["a:TramiteId"] ?? 0;
    const urlIntencionCobro = item["a:UrlIntencionCobro"];

    // 8. Retornar un JSON limpio y amigable
    return {
      codigoError,
      mensajeError,
      folioPaseCaja,
      grupoTramiteId,
      padronId,
      solicitudId,
      tramiteId,
      urlIntencionCobro,
      // Helper para verificar si hay error
      tieneError: codigoError !== 0,
      // Helper para obtener el link (alias para compatibilidad)
      link: urlIntencionCobro,
    };
  } catch (error) {
    console.error("Error parseando el XML:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    return null;
  }
};
