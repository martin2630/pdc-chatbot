interface GetPredialServiceParams {
  rfc: string;
  claveCatastral: string;
}

export const getPredialService = async ({
  rfc,
  claveCatastral,
}: GetPredialServiceParams) => {
  const claveAcceso = "1234567890123456789";
  const soapBody = `
              <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cat="Catastro">
                <soapenv:Header/>
                <soapenv:Body>
                  <cat:CreaPasePredialPlayaWS.Execute>
                    <cat:Prediocvecatastral>${claveCatastral}</cat:Prediocvecatastral>
                    <cat:Rfcpersona>${rfc}</cat:Rfcpersona>
                    <cat:Claveacceso>${claveAcceso}</cat:Claveacceso>
                  </cat:CreaPasePredialPlayaWS.Execute>
                </soapenv:Body>
              </soapenv:Envelope>
            `;
  const res = await fetch(
    "http://201.98.122.130/Catastro/acreapasepredialplayaws.aspx",
    {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=utf-8" },
      body: soapBody,
    }
  );
  const result = await res.text();
  return result;
};
