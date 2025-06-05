# Fetch Log - API Inspector Chrome Extension

A powerful Chrome Extension for developers to monitor, filter, and inspect fetch/XHR network requests with a clean, intuitive UI.

## Features

- 🔍 **Real-time monitoring** of fetch/XHR requests
- 🎯 **URL filtering** with persistent storage
- 📋 **One-click copy** for requests, responses, and headers
- 📊 **Detailed inspection** with formatted JSON
- ⚙️ **Customizable settings** with data management
- 🎨 **Clean, developer-focused UI** with smooth animations

## Tech Stack

- **React 18** with functional components and hooks
- **TypeScript** with strict mode
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for building
- **Chrome Extension API** (Manifest V3)
- **Chrome Debugger API** for network monitoring

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Google Chrome browser
- Basic knowledge of Chrome Extension development

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fetch-log
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the extension**

   ```bash
   npm run build
   ```

4. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder from this project
   - The extension icon should appear in your Chrome toolbar

### Development

For development with hot reload:

```bash
npm run dev
```

Then reload the extension in Chrome after making changes.

### Project Structure

```
fetch-log/
├── src/
│   ├── components/
│   │   ├── App.tsx           # Main app component
│   │   ├── Header.tsx        # Navigation header
│   │   ├── RequestList.tsx   # List of captured requests
│   │   ├── RequestDetail.tsx # Detailed view of single request
│   │   └── Settings.tsx      # Settings and preferences
│   ├── background.ts         # Service worker for capturing requests
│   ├── content.ts           # Content script (minimal)
│   ├── popup.tsx            # Popup entry point
│   ├── types.ts             # TypeScript type definitions
│   ├── utils.ts             # Utility functions
│   └── styles.css           # Global styles with Tailwind
├── icons/                   # Extension icons
├── manifest.json           # Chrome extension manifest
├── popup.html             # Popup HTML template
└── package.json           # Dependencies and scripts
```

## Usage

### Basic Usage

1. **Install and activate** the extension in Chrome
2. **Navigate to any website** that makes API calls
3. **Click the extension icon** to open the popup
4. **View captured requests** in real-time

### Filtering Requests

- Use the **search bar** to filter requests by URL substring
- Filters are **automatically saved** and persist across sessions
- Clear the filter to see all captured requests

### Inspecting Requests

- **Click on any request** to view detailed information
- **Copy individual headers** using the copy icon
- **Copy entire requests/responses** using the copy buttons
- **Navigate back** using the arrow button

### Managing Data

- Access **Settings** via the gear icon
- **Clear all requests** to start fresh
- **Toggle auto-clear** on tab refresh
- **View extension information** in the About section

## Development Notes

### Architecture

The extension uses Chrome's Debugger API to capture network requests:

1. **Background script** attaches to active tabs and monitors network events
2. **Popup interface** communicates with background script via messaging
3. **Chrome storage** persists filters and settings
4. **React components** provide the user interface

### Key Features Implementation

- **Network monitoring**: Uses `chrome.debugger` API with Network domain
- **Data persistence**: `chrome.storage.local` for filters and settings
- **Copy functionality**: `navigator.clipboard` API with fallback
- **URL filtering**: Client-side filtering with case-insensitive matching
- **Responsive design**: Tailwind CSS with mobile-first approach

### Building for Production

```bash
npm run build
```

This creates a `dist` folder with all the necessary files for the Chrome extension.

### Testing

The extension captures requests that:

- Start with `http` or `https`
- Contain `/api/` in the URL, OR
- Have `Content-Type: application/json` headers

To test, visit sites like:

- JSONPlaceholder (`jsonplaceholder.typicode.com`)
- Any modern web application with API calls
- GitHub, Twitter, or other sites with rich API interactions

## Troubleshooting

### Extension not capturing requests

1. **Check permissions**: Ensure the extension has debugger permissions
2. **Refresh the tab**: Some sites require a fresh page load
3. **Check filter**: Make sure your URL filter isn't too restrictive
4. **Look for errors**: Check Chrome DevTools console for errors

### Copy functionality not working

1. **HTTPS required**: Clipboard API requires secure context
2. **Permissions**: Ensure site allows clipboard access
3. **Fallback**: Extension includes fallback for older browsers

### Performance considerations

- The extension only captures API-like requests (not all network traffic)
- Requests are stored in memory and cleared on tab refresh (configurable)
- Large response bodies may impact memory usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing code style
4. Test thoroughly with various websites
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
