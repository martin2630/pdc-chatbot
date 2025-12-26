import { generarPaseCajaPDF } from "@/utils/generarPaseCajaPDF";
import { paseCajaXml2Json } from "@/utils/paseCajaXml2Json";

export const getPaseCajaService = async (referenciaCodigo: string) => {
  const soapBody = `
  <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
    <Body>
      <WSConsultaPasesCaja.Execute xmlns="Tlania">
        <Referenciacodigo>${referenciaCodigo}</Referenciacodigo>
      </WSConsultaPasesCaja.Execute>
    </Body>
  </Envelope>
`;
  const res = await fetch(
    "http://201.98.122.130/Tlania/aWSConsultaPasesCaja.aspx",
    {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=utf-8" },
      body: soapBody,
    }
  );
  const response = await res.text();
  const data = paseCajaXml2Json(response);

  if (!data) {
    throw new Error("No se pudo generar el pase de caja");
  }

  const pdfBase64 = await generarPaseCajaPDF(data);

  console.log("data", data);

  return {
    fileName: `pase_caja_${data.solicitudId}.pdf`,
    pdfBase64,
  };
};
