export const getEstadoDeCuentaService = async (
  rfc: string,
  claveCatastral: string
) => {
  const url = "http://201.98.122.130/Tlania/aWSConsultaPasesCaja.aspx";
  const claveAcceso = "00CrhZiSRFK4y6KEebw9";
  const soapBody = `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cat="Catastro">
    <soapenv:Header/>
    <soapenv:Body>
        <cat:ConsultaEdoCuentaPredialWS.Execute>
          <cat:Prediocvecatastral>${claveCatastral}</cat:Prediocvecatastral>
          <cat:Rfcpersona>${rfc}</cat:Rfcpersona>
          <cat:Claveacceso>${claveAcceso}</cat:Claveacceso>
        </cat:ConsultaEdoCuentaPredialWS.Execute>
    </soapenv:Body>
  </soapenv:Envelope>
`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/xml; charset=utf-8" },
    body: soapBody,
  });
  const response = await res.text();
  // const data = estadoCuentaXml2Json(response);
  return response;
};
