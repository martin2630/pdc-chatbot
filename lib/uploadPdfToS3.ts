// lib/uploadPdfToS3.ts
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { s3 } from "@/lib/s3";

export async function uploadPdfToS3({
  base64,
  fileName,
  folder = "pases-caja",
}: {
  base64: string;
  fileName: string;
  folder?: string;
}) {
  const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;

  const buffer = Buffer.from(cleanBase64, "base64");

  const key = `${folder}/${Date.now()}-${fileName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: "application/pdf",
      ContentDisposition: `attachment; filename=${key}`,
    })
  );

  return key;
}
