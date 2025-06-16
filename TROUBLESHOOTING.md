# 🔧 Fetch Log Extension Troubleshooting Guide

## Quick Diagnosis Steps

### 1. **Check Extension Installation**
- ✅ Extension appears in `chrome://extensions/`
- ✅ Extension is **enabled**
- ✅ No error messages in the extension details

### 2. **Verify Permissions**
- ✅ Extension has **debugger** permission
- ✅ Extension has **storage** permission  
- ✅ Extension has **activeTab** permission

### 3. **Test the Activation Flow**
1. Open the test page: `test-page.html`
2. Click the extension icon to open popup
3. Click **"Start Debugging"** button in popup
4. Click test buttons on the test page
5. Check if requests appear in extension popup

## Common Issues & Solutions

### 🚫 **Issue: No requests captured at all**

**Possible Causes:**
- Debugger not started
- Page doesn't make qualifying API calls
- Chrome debugger API restrictions

**Solutions:**
1. **Always click "Start Debugging" first**
   ```
   Extension Popup → Start Debugging → Test API calls
   ```

2. **Check browser console for errors**
   - Open DevTools (F12)
   - Look for extension-related errors
   - Check both page console and extension popup console

3. **Verify the page makes API calls**
   - Open Chrome DevTools → Network tab
   - Refresh page and look for XHR/Fetch requests
   - If no requests in DevTools, extension won't capture them

4. **Test with known working pages**
   - Use the provided `test-page.html`
   - Try sites like GitHub, Twitter, or any modern web app

### 🔄 **Issue: Popup closes when page refreshes**

**This is normal Chrome behavior:**
- Extension popups automatically close on navigation/refresh
- This is a Chrome security feature and cannot be changed
- **Workaround**: Open popup in new window (right-click extension icon → "Open in new window")

### 🎯 **Issue: Only some requests are captured**

**This is by design - the extension filters requests:**

Current filtering criteria (any ONE of these):
- URL contains `/api/`, `/v1/`, `/v2/`, `/graphql`, `/rest/`
- Content-Type contains `application/json`
- Request method is POST, PUT, PATCH, or DELETE
- Request initiator type is `fetch` or `xmlhttprequest`

**To capture more requests**, modify `src/background.ts` line 70-85.

### 🚨 **Issue: "Failed to attach debugger" errors**

**Causes:**
- Trying to debug protected pages (chrome://, extension pages)
- Another debugger already attached
- Insufficient permissions

**Solutions:**
1. **Test on regular websites** (not chrome:// pages)
2. **Close other debugging tools** (DevTools, other extensions)
3. **Reload the extension** in chrome://extensions/

### 📱 **Issue: Extension works but UI is broken**

**Check for:**
- Build errors in console
- Missing CSS/JS files
- Popup size constraints

**Solutions:**
1. **Rebuild the extension**
   ```bash
   npm run build
   ```
2. **Reload extension** in chrome://extensions/
3. **Check popup dimensions** (should be 400x600px)

## Advanced Debugging

### 🔍 **Enable Extension Console Logging**

1. **Background Script Logs:**
   - Go to `chrome://extensions/`
   - Click "Inspect views: background page" under your extension
   - Check console for debugging messages

2. **Popup Script Logs:**
   - Right-click extension popup → "Inspect"
   - Check console for errors

### 🛠️ **Manual Testing Steps**

1. **Test Basic Functionality:**
   ```javascript
   // In browser console on any page:
   fetch('https://jsonplaceholder.typicode.com/posts/1')
     .then(r => r.json())
     .then(console.log);
   ```

2. **Test Extension Messaging:**
   ```javascript
   // In extension popup console:
   chrome.runtime.sendMessage({action: "getRequests"}, console.log);
   ```

3. **Test Debugger Attachment:**
   ```javascript
   // In background script console:
   chrome.tabs.query({active: true, currentWindow: true}, tabs => {
     chrome.debugger.attach({tabId: tabs[0].id}, "1.3");
   });
   ```

### 📊 **Expected Behavior**

**When working correctly:**
1. Click "Start Debugging" → Console shows "Starting debugger for tab: X"
2. Make API call → Console shows "Capturing request: [URL] [METHOD]"
3. Open popup → Shows captured requests in list
4. Click request → Shows detailed view with headers/body

**Console Output Example:**
```
Starting debugger for tab: 123
Debugger attached to tab: 123
Network monitoring enabled for tab: 123
Capturing request: https://api.example.com/data GET
```

## Browser Compatibility

### ✅ **Supported:**
- Chrome 88+ (Manifest V3 support)
- Chromium-based browsers (Edge, Brave, etc.)

### ❌ **Not Supported:**
- Firefox (different extension API)
- Safari (different extension system)
- Chrome versions < 88

## Performance Notes

- Extension only monitors when popup is open or recently used
- Debugger automatically detaches when switching tabs
- Memory usage is minimal (requests stored in Map, cleared on tab refresh)

## Getting Help

If issues persist:

1. **Check the GitHub issues** for similar problems
2. **Provide detailed information:**
   - Chrome version
   - Extension version
   - Console error messages
   - Steps to reproduce
   - Test page URL

3. **Include logs from:**
   - Background script console
   - Popup console  
   - Page console
