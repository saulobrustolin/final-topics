import { S3Client, PutObjectCommand, GetObjectCommand, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: process.env.S3_ENDPOINT || "http://localhost:8333",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "any",
    secretAccessKey: process.env.S3_SECRET_KEY || "any",
  },
  forcePathStyle: true,
});

const ensureBucketExists = async (bucketName) => {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch (error) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    } else {
      throw error;
    }
  }
};

export async function uploadFile(file, bucket, key) {
  await ensureBucketExists(bucket);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);
  return key;
}

export async function getPresignedUrl(bucket, key) {
  if (!key) return null;
  
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  let url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  url = url.replace("filer", "localhost");

  return url;
}

export async function getFileStream(bucket, key) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3Client.send(command);
  return {
    stream: response.Body,
    contentType: response.ContentType,
    contentLength: response.ContentLength
  };
}

export const S3Service = {
  uploadFile,
  getPresignedUrl,
  getFileStream
};
