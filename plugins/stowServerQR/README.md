# StowServerQR

Generate a QR code containing your Stash server credentials for easy setup in the Stow iOS/macOS app.

## Features

- **Auto-detection**: Automatically detects your server URL
- **Secure**: Includes API key for authenticated access
- **Customizable**: Set a friendly server name
- **Security warnings**: Clear warnings about API key exposure
- **Auto-hide**: QR code automatically hides after 60 seconds
- **One-scan setup**: Scan with your device to instantly add server to Stow app

## Installation

1. Add plugin source to Stash:
   - Go to **Settings → Plugins → Available Plugins**
   - Click **Add Source**
   - Enter: `https://plugins.stow.rocks/index.yml`
   - Click **Reload**

2. Install StowServerQR:
   - Find "StowServerQR" in the list
   - Click **Install**

## Usage

1. Navigate to **Settings → Plugins → Stow QR Code**
2. Enter a friendly name for your server (e.g., "Home Stash")
3. Click **Show QR Code**
4. Scan the QR code with your iPhone, iPad, or Mac camera
5. The Stow app will open and prompt you to add the server

## Security

⚠️ **Important**: The QR code contains your API key. Only scan it on devices you trust.

The plugin includes several security features:
- QR code is hidden by default
- Must click "Show QR Code" to display
- Auto-hides after 60 seconds
- Clear security warnings

## Stow App Integration

The QR code contains JSON data:
```json
{
  "name": "My Stash Server",
  "url": "http://192.168.1.10:9999",
  "apiKey": "your-api-key-here"
}
```

The Stow app should:
1. Register URL scheme: `stow://`
2. Handle deep link with QR data
3. Parse JSON and show "Add Server" dialog
4. Check if URL exists and offer to update instead

## Requirements

- Stash v0.20.0 or later
- API key configured in Stash settings

## License

MIT
