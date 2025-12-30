import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3 } from "@/lib/s3";

export async function getPdfSignedUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  });

  // URL válida por 30 minutos
  return getSignedUrl(s3, command, { expiresIn: 60 * 30 });
}
