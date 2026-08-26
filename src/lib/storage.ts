const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "/api/v1";

export type UploadResult = {
  url: string;
};

/**
 * Uploads a document to the platform storage endpoint
 * (POST /api/v1/storage/upload on the Spring Boot backend).
 */
export const uploadFile = async (
  path: string,
  file: File,
): Promise<UploadResult> => {
  const form = new FormData();
  form.append("file", file);
  form.append("path", path);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/storage/upload`, {
      method: "POST",
      body: form,
    });
  } catch {
    throw new Error(
      "Upload service is not available yet. Document uploads will be enabled once the new backend is connected.",
    );
  }

  if (!response.ok) {
    throw new Error("Upload failed. Please try again.");
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  const url =
    data && typeof data === "object" && "url" in data
      ? String((data as { url: unknown }).url)
      : "";

  if (!url) {
    throw new Error("Upload service returned an invalid response.");
  }

  return { url };
};
