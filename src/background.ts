import { NetworkRequest } from "./types";

const requests = new Map<string, NetworkRequest>();
let activeTabId: number | null = null;

// Listen for extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    activeTabId = tab.id;
    await startDebugging(tab.id);
  }
});

// Listen for tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (activeTabId && activeTabId !== activeInfo.tabId) {
    await stopDebugging(activeTabId);
  }
  activeTabId = activeInfo.tabId;
  await startDebugging(activeInfo.tabId);
});

// Listen for tab updates (refresh)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === "loading" && tabId === activeTabId) {
    // Clear requests on tab refresh if setting is enabled
    const settings = await chrome.storage.local.get(["clearOnTabRefresh"]);
    if (settings.clearOnTabRefresh !== false) {
      clearRequestsForTab(tabId);
    }
  }
});

async function startDebugging(tabId: number) {
  try {
    await chrome.debugger.attach({ tabId }, "1.3");
    await chrome.debugger.sendCommand({ tabId }, "Network.enable");

    chrome.debugger.onEvent.addListener((source, method, params) => {
      if (source.tabId === tabId) {
        handleNetworkEvent(method, params, tabId);
      }
    });
  } catch (error) {
    console.error("Failed to attach debugger:", error);
  }
}

async function stopDebugging(tabId: number) {
  try {
    await chrome.debugger.detach({ tabId });
  } catch (error) {
    // Ignore errors when detaching
  }
}

function handleNetworkEvent(method: string, params: any, tabId: number) {
  switch (method) {
    case "Network.requestWillBeSent":
      handleRequestWillBeSent(params, tabId);
      break;
    case "Network.responseReceived":
      handleResponseReceived(params);
      break;
    case "Network.loadingFinished":
      handleLoadingFinished(params, tabId);
      break;
  }
}

function handleRequestWillBeSent(params: any, tabId: number) {
  const { requestId, request, timestamp } = params;

  // Only capture fetch/XHR requests
  if (
    request.url.startsWith("http") &&
    (request.url.includes("/api/") ||
      request.headers["Content-Type"]?.includes("application/json") ||
      request.headers["content-type"]?.includes("application/json"))
  ) {
    const networkRequest: NetworkRequest = {
      id: requestId,
      url: request.url,
      method: request.method,
      status: 0,
      timestamp: timestamp * 1000,
      requestHeaders: request.headers || {},
      responseHeaders: {},
      requestBody: request.postData?.data,
      tabId,
    };

    requests.set(requestId, networkRequest);
  }
}

function handleResponseReceived(params: any) {
  const { requestId, response } = params;
  const request = requests.get(requestId);

  if (request) {
    request.status = response.status;
    request.responseHeaders = response.headers || {};
    requests.set(requestId, request);
  }
}

async function handleLoadingFinished(params: any, tabId: number) {
  const { requestId } = params;
  const request = requests.get(requestId);

  if (request) {
    try {
      const responseBody = (await chrome.debugger.sendCommand(
        { tabId },
        "Network.getResponseBody",
        { requestId }
      )) as { body: string };
      request.responseBody = responseBody.body;
      requests.set(requestId, request);
    } catch (error) {
      // Response body might not be available
    }
  }
}

function clearRequestsForTab(tabId: number) {
  for (const [key, request] of requests.entries()) {
    if (request.tabId === tabId) {
      requests.delete(key);
    }
  }
}

// Message handling for popup communication
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.action) {
    case "getRequests":
      const tabRequests = Array.from(requests.values()).filter(
        (req) => req.tabId === activeTabId
      );
      sendResponse({ requests: tabRequests });
      break;
    case "clearRequests":
      if (activeTabId) {
        clearRequestsForTab(activeTabId);
      }
      sendResponse({ success: true });
      break;
  }
});

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      activeTabId = tabs[0].id;
      startDebugging(tabs[0].id);
    }
  });
});
