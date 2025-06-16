import { useState, useEffect } from "react";
import { NetworkRequest, ViewType, ExtensionSettings } from "../types";
import RequestList from "./RequestList";
import RequestDetail from "./RequestDetail";
import Settings from "./Settings";
import Header from "./Header";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(
    null
  );
  const [filter, setFilter] = useState("");
  const [settings, setSettings] = useState<ExtensionSettings>({
    clearOnTabRefresh: true,
    darkMode: false,
    savedFilters: [],
  });

  // Load initial data
  useEffect(() => {
    loadRequests();
    loadSettings();
    loadFilter();
  }, []);

  // Save filter to storage
  useEffect(() => {
    chrome.storage.local.set({ filter });
  }, [filter]);

  const loadRequests = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "getRequests",
      });
      if (response?.requests) {
        setRequests(response.requests);
      }
    } catch (error) {
      console.error("Failed to load requests:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const stored = await chrome.storage.local.get(["settings"]);
      if (stored.settings) {
        setSettings(stored.settings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const loadFilter = async () => {
    try {
      const stored = await chrome.storage.local.get(["filter"]);
      if (stored.filter) {
        setFilter(stored.filter);
      }
    } catch (error) {
      console.error("Failed to load filter:", error);
    }
  };

  const saveSettings = async (newSettings: ExtensionSettings) => {
    setSettings(newSettings);
    await chrome.storage.local.set({ settings: newSettings });
  };

  const clearAllRequests = async () => {
    try {
      await chrome.runtime.sendMessage({ action: "clearRequests" });
      setRequests([]);
    } catch (error) {
      console.error("Failed to clear requests:", error);
    }
  };

  const startDebugging = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "startDebugging",
      });
      if (response?.success) {
        console.log("Debugging started successfully");
        // Refresh requests after starting debugging
        await loadRequests();
      } else {
        console.error("Failed to start debugging:", response?.error);
      }
    } catch (error) {
      console.error("Failed to start debugging:", error);
    }
  };

  const filteredRequests = requests.filter((request) =>
    request.url.toLowerCase().includes(filter.toLowerCase())
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case "detail":
        return selectedRequest ? (
          <RequestDetail
            request={selectedRequest}
            onBack={() => setCurrentView("list")}
          />
        ) : null;
      case "settings":
        return (
          <Settings
            settings={settings}
            onSettingsChange={saveSettings}
            onBack={() => setCurrentView("list")}
            onClearAll={clearAllRequests}
          />
        );
      default:
        return (
          <RequestList
            requests={filteredRequests}
            filter={filter}
            onFilterChange={setFilter}
            onRequestSelect={(request) => {
              setSelectedRequest(request);
              setCurrentView("detail");
            }}
            onRefresh={loadRequests}
            onStartDebugging={startDebugging}
          />
        );
    }
  };

  return (
    <div className="w-full h-full bg-white text-gray-900">
      <Header
        currentView={currentView}
        onSettingsClick={() => setCurrentView("settings")}
        onTitleClick={() => setCurrentView("list")}
        requestCount={filteredRequests.length}
      />
      {renderCurrentView()}
    </div>
  );
}
