import { XMLParser } from "fast-xml-parser";

export const estadoCuentaXml2Json = (xmlSoap: string) => {
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

    // 2. Namespace para el Envelope
    const envelope = soapObj["SOAP-ENV:Envelope"];

    if (!envelope) {
      console.error(
        "No se encontró el elemento Envelope en el XML. Claves disponibles:",
        Object.keys(soapObj)
      );
      return null;
    }

    // 3. Body
    const body = envelope["SOAP-ENV:Body"];

    if (!body) {
      console.error(
        "No se encontró el elemento Body en el Envelope. Claves disponibles:",
        Object.keys(envelope)
      );
      return null;
    }

    // 4. Buscar la respuesta ExecuteResponse
    const item =
      body["ConsultaEdoCuentaPredialWS.ExecuteResponse"] ||
      body.ConsultaEdoCuentaPredialWS.ExecuteResponse;

    if (!item) {
      console.error(
        "No se encontró ExecuteResponse. Claves disponibles:",
        Object.keys(body)
      );
      return null;
    }

    // Extraer valores
    const error = item["Error"];

    // 8. Retornar un JSON limpio y amigable
    return {
      error,
    };
  } catch (error) {
    console.error("Error parseando el XML:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    return null;
  }
};
