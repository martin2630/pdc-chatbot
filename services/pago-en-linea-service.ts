import { pagoenLineaXml2Json } from "@/utils/pagoenLineaXml2Json";

export const getPagoEnLineaService = async (referenciaCodigo: string) => {
  const claveAcceso = "1234567890123456789";
  const soapBody = `
          <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
              <Body>
                  <daoGeneraIntenciondecobroGlobal xmlns="http://tempuri.org/">
                      <parStrPaseCaja>${referenciaCodigo}</parStrPaseCaja>
                      <parStrTokenValidate>${claveAcceso}</parStrTokenValidate>
                  </daoGeneraIntenciondecobroGlobal>
              </Body>
          </Envelope>
        `;
  const res = await fetch(
    "http://tesoreria.playadelcarmen.gob.mx:8081/wsSIGEM/coatl/IServiceUrlIntenciondePagoGlobal.svc",
    {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction:
          "http://tempuri.org/IIServiceUrlIntenciondePagoGlobal/daoGeneraIntenciondecobroGlobal",
      },
      body: soapBody,
    }
  );

  const response = await res.text();
  const data = pagoenLineaXml2Json(response);

  if (!data) {
    throw new Error("No se pudo procesar la respuesta del servicio");
  }

  // Retornar los datos parseados
  return {
    error: false,
    link: data.urlIntencionCobro || data.link,
    codigoError: data.codigoError,
    mensajeError: data.mensajeError,
    folioPaseCaja: data.folioPaseCaja,
    grupoTramiteId: data.grupoTramiteId,
    solicitudId: data.solicitudId,
    tramiteId: data.tramiteId,
    urlIntencionCobro: data.urlIntencionCobro,
  };
};
