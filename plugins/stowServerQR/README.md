# StowServerQR

Generate a QR code containing your Stash server credentials for easy setup in the [Stow](https://stow.rocks) iOS/macOS app.

## Installation

1. Add plugin source in Stash:
   - Go to **Settings → Plugins → Available Plugins**
   - Click **Add Source**
   - Enter: `https://plugins.stow.rocks/index.yml`
   - Click **Reload**

2. Find "StowServerQR" and click **Install**

## Usage

1. Navigate to **Settings → Security**
2. Find the "📱 Stow QR" button next to "Generate API Key"
3. Enter a friendly server name
4. Click **📱 Stow QR** to display the QR code
5. Scan with your iPhone, iPad, or Mac camera
6. The Stow app opens and prompts you to add the server

## Security

⚠️ The QR code contains your API key. Only scan on devices you trust.

- QR code is hidden by default
- Auto-hides after 60 seconds
- Clear security warning displayed

## QR Code Data Format

The QR code encodes a JSON string with three fields:

```json
{
  "name": "My Stash Server",
  "url": "http://192.168.1.10:9999",
  "apiKey": "eyJhbGciOiJIUzI1NiIs..."
}
```

| Field    | Type   | Description                                    |
|----------|--------|------------------------------------------------|
| `name`   | string | User-defined server display name               |
| `url`    | string | Stash server URL (auto-detected from browser)  |
| `apiKey` | string | Stash API key (from Settings → Security)       |

## Requirements

- Stash v0.20.0 or later
- API key configured in Stash (Settings → Security → Generate API Key)

## License

MIT
