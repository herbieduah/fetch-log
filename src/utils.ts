import { NetworkRequest } from "./types";

export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          const success = document.execCommand("copy");
          document.body.removeChild(textArea);
          resolve(success);
        });
    } catch (error) {
      resolve(false);
    }
  });
}

export function formatRequestForCopy(request: NetworkRequest): string {
  // Return just the request payload/body
  if (!request.requestBody) {
    return ""; // No request body to copy
  }

  // Try to format as JSON if possible, otherwise return as-is
  const parsed = tryParseJson(request.requestBody);
  if (typeof parsed === "object") {
    return JSON.stringify(parsed, null, 2);
  }

  return request.requestBody;
}

export function formatResponseForCopy(request: NetworkRequest): string {
  // Return just the response body
  if (!request.responseBody) {
    return ""; // No response body to copy
  }

  // Try to format as JSON if possible, otherwise return as-is
  const parsed = tryParseJson(request.responseBody);
  if (typeof parsed === "object") {
    return JSON.stringify(parsed, null, 2);
  }

  return request.responseBody;
}

export function tryParseJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case "GET":
      return "text-green-600 bg-green-50";
    case "POST":
      return "text-blue-600 bg-blue-50";
    case "PUT":
      return "text-yellow-600 bg-yellow-50";
    case "DELETE":
      return "text-red-600 bg-red-50";
    case "PATCH":
      return "text-purple-600 bg-purple-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) {
    return "text-green-600";
  } else if (status >= 300 && status < 400) {
    return "text-yellow-600";
  } else if (status >= 400) {
    return "text-red-600";
  }
  return "text-gray-600";
}

export function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;

  const start = url.substring(0, maxLength / 2);
  const end = url.substring(url.length - maxLength / 2);
  return `${start}...${end}`;
}
