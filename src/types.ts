export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  timestamp: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  tabId: number;
}

export interface ExtensionSettings {
  clearOnTabRefresh: boolean;
  darkMode: boolean;
  savedFilters: string[];
}

export interface RequestFilter {
  urlSubstring: string;
}

export type ViewType = "list" | "detail" | "settings";
