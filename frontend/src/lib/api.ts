/**
 * API client for Hybrid Search Backend
 * Provides functions to interact with the FastAPI backend
 */

export interface ApiSearchResult {
  id: string;
  title: string;
  snippet: string;
  scores: {
    keyword: number;
    semantic: number;
    hybrid: number;
  };
  metadata: {
    filename: string;
    content_length: number;
  };
}

export interface ApiAttachment {
  id: string;
  filename: string;
  created_at: string;
  content_length: number;
}

export interface UploadResponse {
  message: string;
  file_id: number;
  filename: string;
  content_length: number;
}

export interface SearchResponse {
  query: string;
  mode: string;
  results: ApiSearchResult[];
  total_results: number;
}

export interface AttachmentsResponse {
  attachments: ApiAttachment[];
  total: number;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Upload a file to the backend
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/v1/hybrid-search/upload`, {
    method: "POST",
    body: formData,
    credentials: "include", // Send cookies
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Upload failed" }));
    throw new ApiError(response.status, errorData.detail || "Upload failed");
  }

  return response.json();
}

/**
 * Search for documents
 */
export async function searchDocuments(
  query: string,
  mode: "keyword" | "semantic" | "hybrid" = "hybrid"
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    mode: mode,
  });

  const response = await fetch(`/api/v1/hybrid-search/search?${params}`, {
    credentials: "include", // Send cookies
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Search failed" }));
    throw new ApiError(response.status, errorData.detail || "Search failed");
  }

  return response.json();
}

/**
 * Get list of uploaded attachments
 */
export async function getAttachments(): Promise<AttachmentsResponse> {
  console.log(
    "Fetching attachments from:",
    `/api/v1/hybrid-search/attachments`
  );

  const response = await fetch(`/api/v1/hybrid-search/attachments`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include", // Send cookies
  });

  console.log("Attachments API response status:", response.status);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch attachments" }));
    console.error("Attachments API error:", errorData);
    throw new ApiError(
      response.status,
      errorData.detail || "Failed to fetch attachments"
    );
  }

  const data = await response.json();
  console.log("Attachments API response data:", data);
  return data;
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(attachmentId: string): Promise<void> {
  const response = await fetch(
    `/api/v1/hybrid-search/attachments/${attachmentId}`,
    {
      method: "DELETE",
      credentials: "include", // Send cookies
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Delete failed" }));
    throw new ApiError(response.status, errorData.detail || "Delete failed");
  }
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<{ status: string }> {
  try {
    const response = await fetch(`/health`, {
      credentials: "include", // Send cookies
    });
    if (!response.ok) {
      throw new Error("Health check failed");
    }
    return response.json();
  } catch {
    return { status: "unavailable" };
  }
}
