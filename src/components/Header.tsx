import { Settings } from "lucide-react";
import { ViewType } from "../types";

interface HeaderProps {
  currentView: ViewType;
  onSettingsClick: () => void;
  onTitleClick: () => void;
  requestCount: number;
}

export default function Header({
  currentView,
  onSettingsClick,
  onTitleClick,
  requestCount,
}: HeaderProps) {
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
        {currentView === "list" && requestCount > 0 && (
          <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
            {requestCount}
          </span>
        )}
      </div>

      {currentView === "list" && (
        <button
          onClick={onSettingsClick}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      )}
    </div>
  );
}
