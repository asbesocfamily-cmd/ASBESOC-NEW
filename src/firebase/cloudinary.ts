import { auth } from "./firebaseConfig";

export function mediaServiceUrl() {
  const value = import.meta.env.VITE_MEDIA_API_URL?.trim();
  if (!value)
    throw new Error(
      "Media setup is not complete. Connect the Cloudinary account first.",
    );
  const url = new URL(value);
  if (
    url.protocol !== "https:" &&
    !(
      import.meta.env.DEV &&
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname)
    )
  )
    throw new Error("The media service must use HTTPS.");
  return value.replace(/\/$/, "");
}
async function request(path: string, init?: RequestInit) {
  const base = mediaServiceUrl();
  const user = auth.currentUser;
  if (!user) throw new Error("Please sign in to continue.");
  const response = await fetch(base + path, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${await user.getIdToken()}`,
    },
  });
  if (!response.ok) {
    const details = await response.json().catch(() => null);
    throw new Error(
      details?.error || "The media service could not complete this action.",
    );
  }
  return response;
}
export async function uploadCloudinary(
  file: File,
  path: string,
  progress: (value: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  const response = await request("/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
    signal,
  });
  const signed = (await response.json()) as {
    endpoint: string;
    params: Record<string, string | number | boolean>;
  };
  if (
    !/^https:\/\/api\.cloudinary\.com\/v1_1\/[a-zA-Z0-9_-]+\/(image|video)\/upload$/.test(
      signed.endpoint,
    )
  )
    throw new Error("Invalid upload destination.");
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Upload cancelled."));
      return;
    }
    const xhr = new XMLHttpRequest();
    const cancel = () => xhr.abort();
    signal?.addEventListener("abort", cancel, { once: true });
    xhr.open("POST", signed.endpoint);
    xhr.timeout = 10 * 60 * 1000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        progress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onloadend = () => signal?.removeEventListener("abort", cancel);
    xhr.onerror = () =>
      reject(new Error("Upload connection failed. Please retry."));
    xhr.ontimeout = () => reject(new Error("Upload timed out. Please retry."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    xhr.onload = () => {
      let result;
      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Invalid upload response."));
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(result.error?.message || "Cloudinary upload failed."));
        return;
      }
      if (
        result.public_id !== signed.params.public_id ||
        result.type !== signed.params.type ||
        typeof result.secure_url !== "string" ||
        !result.secure_url.startsWith("https://res.cloudinary.com/")
      ) {
        reject(new Error("The uploaded file could not be verified."));
        return;
      }
      resolve(result.secure_url);
    };
    const form = new FormData();
    for (const [key, value] of Object.entries(signed.params))
      form.append(key, String(value));
    form.append("file", file);
    xhr.send(form);
  });
}
export async function deleteCloudinary(path: string) {
  await request("/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
}
export async function cloudinaryBlobUrl(path: string) {
  const response = await request(`/asset?path=${encodeURIComponent(path)}`);
  return URL.createObjectURL(await response.blob());
}
