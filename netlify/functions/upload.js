import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto", // Cloudflare R2 always "auto"
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const auth = event.headers["authorization"] || "";
  if (!auth.endsWith(process.env.AUTH_TOKEN)) {
    return { statusCode: 403, body: "Forbidden" };
  }

  try {
    const body = JSON.parse(event.body); // { filename, content (base64) }
    const fid = Math.random().toString(36).substring(2, 10);
    const key = `${fid}.html`;

    // upload to R2
    await client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: Buffer.from(body.content, "base64"),
      ContentType: "text/html",
    }));

    // public link
    const url = `${process.env.R2_PUBLIC_DOMAIN}/${key}`;
    return { statusCode: 200, body: JSON.stringify({ url }) };
  } catch (err) {
    return { statusCode: 500, body: "Error: " + err.message };
  }
}
