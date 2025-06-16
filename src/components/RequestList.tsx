import {
  Search,
  RefreshCw,
  ChevronRight,
  Copy,
  Play,
  Loader2,
} from "lucide-react";
import { NetworkRequest } from "../types";
import {
  getMethodColor,
  getStatusColor,
  extractFunctionName,
  copyToClipboard,
  formatRequestForCopy,
  formatResponseForCopy,
} from "../utils";
import { useState } from "react";

interface RequestListProps {
  requests: NetworkRequest[];
  filter: string;
  onFilterChange: (filter: string) => void;
  onRequestSelect: (request: NetworkRequest) => void;
  onRefresh: () => void;
  onStartDebugging: () => void;
}

export default function RequestList({
  requests,
  filter,
  onFilterChange,
  onRequestSelect,
  onRefresh,
  onStartDebugging,
}: RequestListProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const handleCopy = async (text: string, itemId: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedItems(new Set([...copiedItems, itemId]));
      setTimeout(() => {
        setCopiedItems((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }, 2000);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by URL substring"
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-lg font-medium mb-2">No API requests captured</p>
            <p className="text-sm mb-4">
              Click "Start Debugging" to monitor network requests on this tab.
              <br />
              <span className="text-xs text-gray-500 mt-1 block">
                Requests will appear here in real-time with loading indicators
              </span>
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={onStartDebugging}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Play size={16} />
                Start Debugging
              </button>
              <button
                onClick={onRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by URL substring"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {requests.map((request) => {
          const { baseUrl, functionName } = extractFunctionName(request.url);

          return (
            <div
              key={request.id}
              className="border-b border-gray-200 last:border-b-0"
            >
              <div
                className="request-row flex items-center justify-between"
                onClick={() => onRequestSelect(request)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`method-badge ${getMethodColor(
                        request.method
                      )}`}
                    >
                      {request.method}
                    </span>
                    <div className="flex items-center gap-1">
                      {!request.status && (
                        <Loader2
                          size={12}
                          className="animate-spin text-blue-500"
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          !request.status
                            ? "text-blue-600 font-semibold"
                            : getStatusColor(request.status)
                        }`}
                      >
                        {request.status ? request.status : "Loading..."}
                      </span>
                    </div>
                  </div>
                  <div
                    className="text-sm text-gray-900 break-all"
                    title={request.url}
                  >
                    {functionName ? (
                      <>
                        <span className="text-gray-600">{baseUrl}</span>
                        <span className="font-semibold text-blue-700 bg-blue-50 px-1 rounded">
                          {functionName}
                        </span>
                      </>
                    ) : (
                      <span>{request.url}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="text-gray-400 ml-2" size={16} />
              </div>

              <div className="px-3 pb-3 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(
                      formatRequestForCopy(request),
                      `req-${request.id}`
                    );
                  }}
                  className={`copy-button ${
                    copiedItems.has(`req-${request.id}`) ? "copied" : ""
                  }`}
                  disabled={
                    !request.requestBody || request.requestBody.trim() === ""
                  }
                  title={
                    request.requestBody && request.requestBody.trim() !== ""
                      ? `Copy request payload (${request.requestBody.length} chars)`
                      : `No request body (method: ${
                          request.method
                        }, hasBody: ${!!request.requestBody})`
                  }
                >
                  <Copy size={12} className="inline mr-1" />
                  {copiedItems.has(`req-${request.id}`)
                    ? "Copied!"
                    : "Copy Payload"}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(
                      formatResponseForCopy(request),
                      `res-${request.id}`
                    );
                  }}
                  className={`copy-button ${
                    copiedItems.has(`res-${request.id}`) ? "copied" : ""
                  } ${!request.status ? "loading" : ""}`}
                  disabled={!request.responseBody}
                  title={
                    !request.status
                      ? "Response loading... Please wait for request to complete"
                      : request.responseBody
                      ? "Copy response body"
                      : "No response body available"
                  }
                >
                  {!request.status ? (
                    <>
                      <Loader2 size={12} className="inline mr-1 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Copy size={12} className="inline mr-1" />
                      {copiedItems.has(`res-${request.id}`)
                        ? "Copied!"
                        : "Copy Response"}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
