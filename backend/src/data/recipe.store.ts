// src/storage/minio.ts
// Handles the connection to the Minio object storage.
import { randomUUID } from "crypto";
import { Client } from "minio";
import {
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_USE_SSL,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  NODE_ENV,
} from "../config";

const minioClient = new Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

const USER_UPLOAD_BUCKET = "user-uploads";
// Ensure both bucket exists and that are publicly accessible GET
async function ensureBucketExists(bucketName: string) {
  const exists = await minioClient.bucketExists(bucketName);
  if (!exists) {
    await minioClient.makeBucket(bucketName, "local");
    // Set bucket policy to allow public read access
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
  }
}

// Only initialize storage if not in test environment
if (process.env.NODE_ENV !== "test") {
  ensureBucketExists(USER_UPLOAD_BUCKET).catch(console.error);
}

export const putUserImage = async (
  data: Buffer,
  mimeType: string,
): Promise<string> => {
  const imgExtension = mimeType.split("/")[1];
  const objectName = `${Date.now()}-${randomUUID().toString()}.${imgExtension.toLowerCase()}`;
  await minioClient.putObject(
    USER_UPLOAD_BUCKET,
    objectName,
    data,
    data.length,
  );
  return `/storage/${USER_UPLOAD_BUCKET}/${objectName}`;
};

export const deleteUserImage = async (objectName: string): Promise<void> => {
  await minioClient.removeObject(USER_UPLOAD_BUCKET, objectName);
};
