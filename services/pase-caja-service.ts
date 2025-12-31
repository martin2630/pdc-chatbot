import { getPdfSignedUrl } from "@/lib/getPdfSignedUrl";
import { uploadPdfToS3 } from "@/lib/uploadPdfToS3";
import { generarPaseCajaPDF } from "@/utils/generarPaseCajaPDF";
import { paseCajaResumenMapper } from "@/utils/mappers/pase-caja-resume.mapper";
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

  const s3Key = await uploadPdfToS3({
    base64: pdfBase64,
    fileName: `pase_caja_${data.solicitudId}.pdf`,
  });

  const pdfUrl = await getPdfSignedUrl(s3Key);

  const dataObj = paseCajaResumenMapper({
    ...data,
    codeReference: referenciaCodigo,
    fileName: `pase_caja_${data.solicitudId}.pdf`,
    pdfUrl: pdfUrl,
  });

  return dataObj;
};
