# Stash Plugins

Stash plugins for the Stow ecosystem, hosted at [plugins.stow.rocks](https://plugins.stow.rocks).

## Installation

Add this plugin source to Stash:

1. Open Stash → **Settings → Plugins → Available Plugins**
2. Click **Add Source**
3. Enter URL: `https://plugins.stow.rocks/index.yml`
4. Click **Reload**
5. Browse and install available plugins

## Available Plugins

### StowServerQR

Generate a QR code containing your Stash server credentials for easy setup in the Stow iOS/macOS app.

**Features:**
- Auto-detects server URL
- Includes API key for authentication
- Security warnings and auto-hide timer
- One-scan setup for Stow app

[Documentation](plugins/stowServerQR/README.md)

## Development

```bash
# Install dependencies
npm install

# Build plugins
npm run build

# Output in _site/
```

## License

[GPL-3.0](LICENSE)
