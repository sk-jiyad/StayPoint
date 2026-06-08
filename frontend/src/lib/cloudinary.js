// Uploads an image straight to Cloudinary using a backend-signed request.
// The browser never sees the API secret — only the signature derived from it.

import { uploadApi } from "./api.js";

export async function uploadImage(file) {
  const { timestamp, signature, apiKey, cloudName, folder } = await uploadApi.signature();

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    let message = "Image upload failed";
    try {
      const body = await res.json();
      message = body?.error?.message || message;
    } catch {
      // ignore parse errors, keep default message
    }
    throw new Error(message);
  }

  const data = await res.json();
  return data.secure_url;
}
