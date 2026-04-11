import fs from "fs/promises";
import path from "path";
import { supabase, VIDEOS_BUCKET, ARTIFACTS_BUCKET } from "./supabaseClient";

/**
 * Upload a local file to a Supabase Storage bucket.
 * Returns the storage path (the key inside the bucket).
 */
export const uploadToStorage = async (
  bucket: string,
  storagePath: string,
  localFilePath: string,
  contentType: string
): Promise<string> => {
  const fileBuffer = await fs.readFile(localFilePath);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  return storagePath;
};

/**
 * Generate a short-lived signed URL for a private storage object.
 */
export const getSignedUrl = async (
  bucket: string,
  storagePath: string,
  expiresInSeconds: number = 3600
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(
      `Failed to create signed URL: ${error?.message || "unknown error"}`
    );
  }

  return data.signedUrl;
};

/**
 * Upload a video file to the videos bucket.
 */
export const uploadVideo = async (
  storagePath: string,
  localFilePath: string,
  contentType: string
): Promise<string> => {
  return uploadToStorage(VIDEOS_BUCKET, storagePath, localFilePath, contentType);
};

/**
 * Get a signed URL for a video in the videos bucket.
 */
export const getVideoSignedUrl = async (
  storagePath: string,
  expiresInSeconds?: number
): Promise<string> => {
  return getSignedUrl(VIDEOS_BUCKET, storagePath, expiresInSeconds);
};

/**
 * Get a signed URL for an artifact (e.g. audio) in the artifacts bucket.
 */
export const getArtifactSignedUrl = async (
  storagePath: string,
  expiresInSeconds?: number
): Promise<string> => {
  return getSignedUrl(ARTIFACTS_BUCKET, storagePath, expiresInSeconds);
};

/**
 * Delete a local temp file (best-effort, logs but does not throw).
 */
export const deleteTempFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (_err) {
    console.warn(`Could not delete temp file: ${filePath}`);
  }
};

/**
 * Ensure the local temp directory exists for multer uploads.
 */
export const ensureStorage = async (): Promise<void> => {
  const tmpDir = path.resolve(process.cwd(), "tmp");
  await fs.mkdir(tmpDir, { recursive: true });
};
