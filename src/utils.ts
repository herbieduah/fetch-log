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
  const config = {
    method: request.method,
    url: request.url,
    headers: request.requestHeaders,
    ...(request.requestBody && { body: request.requestBody }),
  };

  return JSON.stringify(config, null, 2);
}

export function formatResponseForCopy(request: NetworkRequest): string {
  const response = {
    status: request.status,
    headers: request.responseHeaders,
    body: request.responseBody ? tryParseJson(request.responseBody) : null,
  };

  return JSON.stringify(response, null, 2);
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
