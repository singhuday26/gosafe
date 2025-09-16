import { supabase } from "@/lib/supabase";

export interface UploadResult {
  url: string;
  path: string;
  hash: string;
}

export async function uploadDocument(
  file: File,
  userId: string
): Promise<UploadResult> {
  const bucket = "documents";
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  const url = urlData.publicUrl;

  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(digest));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return { url, path, hash };
}
