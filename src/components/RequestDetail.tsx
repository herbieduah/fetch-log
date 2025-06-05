import { ArrowLeft, Copy } from "lucide-react";
import { NetworkRequest } from "../types";
import {
  getMethodColor,
  getStatusColor,
  copyToClipboard,
  tryParseJson,
} from "../utils";
import { useState } from "react";

interface RequestDetailProps {
  request: NetworkRequest;
  onBack: () => void;
}

export default function RequestDetail({ request, onBack }: RequestDetailProps) {
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

  const formatJsonString = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold">Request Details</h2>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className={`method-badge ${getMethodColor(request.method)}`}>
            {request.method}
          </span>
          <span
            className={`text-sm font-medium ${getStatusColor(request.status)}`}
          >
            {request.status || "Pending"}
          </span>
        </div>

        <p className="text-sm text-gray-900 break-all">{request.url}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Request Headers */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Request Headers
          </h3>
          <div className="space-y-2">
            {Object.entries(request.requestHeaders).map(([key, value]) => (
              <div
                key={key}
                className="flex items-start justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700">{key}</div>
                  <div className="text-xs text-gray-900 break-all">{value}</div>
                </div>
                <button
                  onClick={() =>
                    handleCopy(`${key}: ${value}`, `req-header-${key}`)
                  }
                  className={`ml-2 p-1 text-gray-400 hover:text-gray-600 ${
                    copiedItems.has(`req-header-${key}`) ? "text-green-600" : ""
                  }`}
                  title="Copy header"
                >
                  <Copy size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Request Body */}
        {request.requestBody && (
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Request Body
            </h3>
            <div className="bg-gray-50 rounded p-3">
              <pre className="text-xs text-gray-900 whitespace-pre-wrap break-all">
                {formatJsonString(request.requestBody)}
              </pre>
            </div>
          </section>
        )}

        {/* Response Headers */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Response Headers
          </h3>
          <div className="space-y-2">
            {Object.entries(request.responseHeaders).map(([key, value]) => (
              <div
                key={key}
                className="flex items-start justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700">{key}</div>
                  <div className="text-xs text-gray-900 break-all">{value}</div>
                </div>
                <button
                  onClick={() =>
                    handleCopy(`${key}: ${value}`, `res-header-${key}`)
                  }
                  className={`ml-2 p-1 text-gray-400 hover:text-gray-600 ${
                    copiedItems.has(`res-header-${key}`) ? "text-green-600" : ""
                  }`}
                  title="Copy header"
                >
                  <Copy size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Response Body */}
        {request.responseBody && (
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Response Body
            </h3>
            <div className="bg-gray-50 rounded p-3">
              <pre className="text-xs text-gray-900 whitespace-pre-wrap break-all">
                {formatJsonString(request.responseBody)}
              </pre>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
