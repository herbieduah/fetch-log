import { Settings, Loader2, RefreshCw } from "lucide-react";
import { ViewType, NetworkRequest } from "../types";

interface HeaderProps {
  currentView: ViewType;
  onSettingsClick: () => void;
  onTitleClick: () => void;
  onRefresh: () => void;
  requestCount: number;
  requests?: NetworkRequest[];
}

export default function Header({
  currentView,
  onSettingsClick,
  onTitleClick,
  onRefresh,
  requestCount,
  requests = [],
}: HeaderProps) {
  const pendingCount = requests.filter((req) => !req.status).length;
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div
        className="flex items-center cursor-pointer hover:text-primary-600"
        onClick={onTitleClick}
      >
        <div className="w-6 h-6 mr-2 bg-primary-500 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">◆</span>
        </div>
        <h1 className="text-lg font-semibold">API Inspector</h1>
        {currentView === "list" && (
          <div className="flex items-center gap-2 ml-2">
            {requestCount > 0 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {requestCount}
              </span>
            )}
            {pendingCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                <Loader2 size={10} className="animate-spin" />
                {pendingCount} loading
              </span>
            )}
          </div>
        )}
      </div>

      {currentView === "list" && (
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            className="refresh-button p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Refresh requests"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={onSettingsClick}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
