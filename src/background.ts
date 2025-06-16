import { NetworkRequest } from "./types";

const requests = new Map<string, NetworkRequest>();
let activeTabId: number | null = null;

// Note: chrome.action.onClicked doesn't fire when default_popup is set
// Instead, we'll start debugging when the popup requests data

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
    console.log("Starting debugger for tab:", tabId);

    // Check if debugger is already attached
    try {
      await chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
        expression: "1",
      });
      console.log("Debugger already attached to tab:", tabId);
      return;
    } catch {
      // Debugger not attached, continue with attachment
    }

    await chrome.debugger.attach({ tabId }, "1.3");
    console.log("Debugger attached to tab:", tabId);

    await chrome.debugger.sendCommand({ tabId }, "Network.enable");
    console.log("Network monitoring enabled for tab:", tabId);

    // Enable additional network events for better request body capture
    try {
      await chrome.debugger.sendCommand(
        { tabId },
        "Network.enableRequestInterception",
        {
          patterns: [{ urlPattern: "*" }],
        }
      );
      console.log("Request interception enabled for tab:", tabId);
    } catch (error) {
      console.log("Request interception not available, continuing without it");
    }

    // Add event listener (note: this adds globally, but we filter by tabId)
    chrome.debugger.onEvent.addListener((source, method, params) => {
      if (source.tabId === tabId) {
        handleNetworkEvent(method, params, tabId);
      }
    });
  } catch (error) {
    console.error("Failed to attach debugger to tab", tabId, ":", error);
    // If attachment fails, the tab might not support debugging
    // This can happen with chrome:// pages, extension pages, etc.
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
    case "Network.requestIntercepted":
      handleRequestIntercepted(params, tabId);
      break;
  }
}

function handleRequestWillBeSent(params: any, tabId: number) {
  const { requestId, request, timestamp } = params;

  // Capture fetch/XHR requests with broader criteria
  if (
    request.url.startsWith("http") &&
    // Common API patterns
    (request.url.includes("/api/") ||
      request.url.includes("/v1/") ||
      request.url.includes("/v2/") ||
      request.url.includes("/graphql") ||
      request.url.includes("/rest/") ||
      // JSON content types
      request.headers["Content-Type"]?.includes("application/json") ||
      request.headers["content-type"]?.includes("application/json") ||
      // XHR/Fetch requests (not navigation)
      request.initiator?.type === "fetch" ||
      request.initiator?.type === "xmlhttprequest" ||
      // POST/PUT/PATCH/DELETE methods (likely API calls)
      ["POST", "PUT", "PATCH", "DELETE"].includes(request.method.toUpperCase()))
  ) {
    console.log("Capturing request:", request.url, request.method);

    // Better request body extraction
    let requestBody = undefined;
    if (request.postData) {
      if (request.postData.data) {
        requestBody = request.postData.data;
        console.log(
          "Found request body in postData.data for:",
          request.method,
          request.url
        );
      } else if (request.postData.params) {
        // Handle form data
        requestBody = request.postData.params
          .map((p: any) => `${p.name}=${p.value}`)
          .join("&");
        console.log(
          "Found request body in postData.params for:",
          request.method,
          request.url
        );
      }
    } else {
      console.log("No postData found for:", request.method, request.url);
    }

    const networkRequest: NetworkRequest = {
      id: requestId,
      url: request.url,
      method: request.method,
      status: 0,
      timestamp: timestamp * 1000,
      requestHeaders: request.headers || {},
      responseHeaders: {},
      requestBody,
      tabId,
    };

    requests.set(requestId, networkRequest);

    // Try to get request body using getRequestPostData if we don't have it
    if (
      !requestBody &&
      ["POST", "PUT", "PATCH"].includes(request.method.toUpperCase())
    ) {
      tryGetRequestPostData(requestId, tabId);
    }
  }
}

async function tryGetRequestPostData(requestId: string, tabId: number) {
  try {
    const postData = (await chrome.debugger.sendCommand(
      { tabId },
      "Network.getRequestPostData",
      { requestId }
    )) as { postData: string };

    const request = requests.get(requestId);
    if (request && postData.postData) {
      console.log("Got request body via getRequestPostData for:", requestId);
      request.requestBody = postData.postData;
      requests.set(requestId, request);
    }
  } catch (error) {
    console.log("Could not get post data for request:", requestId, error);
  }
}

function handleRequestIntercepted(params: any, tabId: number) {
  const { interceptionId, request } = params;

  // Continue the request without modification but capture the body
  chrome.debugger
    .sendCommand({ tabId }, "Network.continueInterceptedRequest", {
      interceptionId,
    })
    .catch((error) => {
      console.log("Failed to continue intercepted request:", error);
    });

  // If this request has a body and matches our criteria, update our stored request
  if (request.postData) {
    const existingRequest = Array.from(requests.values()).find(
      (req) =>
        req.url === request.url &&
        req.method === request.method &&
        req.tabId === tabId
    );

    if (existingRequest) {
      console.log(
        "Updating request body from intercepted request:",
        existingRequest.id
      );
      existingRequest.requestBody = request.postData;
      requests.set(existingRequest.id, existingRequest);
    }
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
      )) as { body: string; base64Encoded?: boolean };

      // Decode base64 if needed
      let decodedBody = responseBody.body;
      if (responseBody.base64Encoded) {
        try {
          decodedBody = atob(responseBody.body);
          console.log("Decoded base64 response body for request:", requestId);
        } catch (decodeError) {
          console.warn("Failed to decode base64 response body:", decodeError);
          // Keep original if decode fails
        }
      } else {
        console.log("Response body not base64 encoded for request:", requestId);
      }

      request.responseBody = decodedBody;
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
chrome.runtime.onMessage.addListener(async (request, _sender, sendResponse) => {
  switch (request.action) {
    case "getRequests":
      // Ensure we're debugging the current active tab
      if (!activeTabId) {
        try {
          const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          });
          if (tabs[0]?.id) {
            activeTabId = tabs[0].id;
            await startDebugging(tabs[0].id);
          }
        } catch (error) {
          console.error("Failed to get active tab:", error);
        }
      }

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
    case "startDebugging":
      try {
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tabs[0]?.id) {
          activeTabId = tabs[0].id;
          await startDebugging(tabs[0].id);
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: "No active tab found" });
        }
      } catch (error) {
        console.error("Failed to start debugging:", error);
        sendResponse({ success: false, error: String(error) });
      }
      break;
  }
  return true; // Keep the message channel open for async responses
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
