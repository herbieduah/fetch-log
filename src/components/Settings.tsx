import { ArrowLeft, Trash2 } from "lucide-react";
import { ExtensionSettings } from "../types";

interface SettingsProps {
  settings: ExtensionSettings;
  onSettingsChange: (settings: ExtensionSettings) => void;
  onBack: () => void;
  onClearAll: () => void;
}

export default function Settings({
  settings,
  onSettingsChange,
  onBack,
  onClearAll,
}: SettingsProps) {
  const toggleSetting = (key: keyof ExtensionSettings) => {
    if (typeof settings[key] === "boolean") {
      onSettingsChange({
        ...settings,
        [key]: !settings[key],
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold">Settings</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* General Settings */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">General</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Clear on tab refresh
                </div>
                <div className="text-xs text-gray-500">
                  Automatically clear captured requests when the tab refreshes
                </div>
              </div>
              <button
                onClick={() => toggleSetting("clearOnTabRefresh")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.clearOnTabRefresh ? "bg-primary-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.clearOnTabRefresh
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Dark mode
                </div>
                <div className="text-xs text-gray-500">
                  Switch to dark theme (coming soon)
                </div>
              </div>
              <button
                onClick={() => toggleSetting("darkMode")}
                disabled
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors opacity-50 cursor-not-allowed ${
                  settings.darkMode ? "bg-primary-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Data Management
          </h3>
          <div className="space-y-4">
            <div>
              <button
                onClick={onClearAll}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
                Clear All Requests
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Remove all captured requests from the current session
              </p>
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">About</h3>
          <div className="text-xs text-gray-600 space-y-2">
            <p>
              <strong>Fetch Log - API Inspector</strong>
            </p>
            <p>Version 1.0.0</p>
            <p>
              Monitor and inspect fetch/XHR network requests with a clean
              developer UI.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
