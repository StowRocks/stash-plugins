# Stow App: QR Code Server Setup Integration

## Overview

The **StowServerQR** Stash plugin adds a "📱 Stow QR" button to the Security settings page (Settings → Security), next to the existing "Generate API Key" and "Clear API Key" buttons. Clicking it displays a QR code containing the server's name, URL, and API key.

The Stow app needs to handle scanning this QR code and automatically adding or updating the server.

## QR Code Data Format

The QR code contains a JSON string:
```json
{
  "name": "My Stash Server",
  "url": "http://192.168.1.10:9999",
  "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Implementation

### 1. Register URL Scheme

Add to the app's `Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>rocks.stow</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>stow</string>
    </array>
  </dict>
</array>
```

### 2. Define QR Payload Model

```swift
struct StowQRPayload: Codable {
    let name: String
    let url: String
    let apiKey: String
}
```

### 3. Handle URL in StowApp

Add `.onOpenURL` to `RootView()` in each platform's `StowApp.swift`:

```swift
RootView()
    .onOpenURL { url in
        handleStowURL(url)
    }
```

```swift
private func handleStowURL(_ url: URL) {
    guard url.scheme == "stow",
          url.host == "add-server",
          let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
          let dataParam = components.queryItems?.first(where: { $0.name == "data" })?.value,
          let jsonData = Data(base64Encoded: dataParam),
          let payload = try? JSONDecoder().decode(StowQRPayload.self, from: jsonData)
    else { return }

    // Check if server with same URL already exists
    let settings = SettingsStore.shared
    if let existing = settings.servers.first(where: { $0.url == Server.cleanURL(payload.url) }) {
        // Update existing server
        var updated = existing
        updated.update(
            name: payload.name,
            url: payload.url,
            apiKey: payload.apiKey,
            syncThumbnails: existing.syncThumbnails,
            syncPreviews: existing.syncPreviews,
            syncFrequency: existing.syncFrequency,
            isEnabled: existing.isEnabled
        )
        settings.updateServer(updated)
    } else {
        // Add new server
        let server = Server(
            name: payload.name,
            url: payload.url,
            apiKey: payload.apiKey
        )
        settings.addServer(server)
    }
}
```

### 4. Update StowServerQR Plugin QR Data

The plugin currently encodes raw JSON in the QR code. For URL scheme handling, it should encode as:

```
stow://add-server?data=<base64_encoded_json>
```

This way, when iOS/macOS scans the QR code, it recognizes the `stow://` scheme and opens the Stow app directly.

### 5. Alternative: Direct JSON Scanning

If you prefer not to use a URL scheme, the app can also handle raw JSON QR codes via a dedicated QR scanner view within the app:

```swift
// In a QR scanner view
func handleScannedCode(_ code: String) {
    guard let data = code.data(using: .utf8),
          let payload = try? JSONDecoder().decode(StowQRPayload.self, from: data)
    else { return }

    // Same add/update logic as above
}
```

### 6. Confirmation UI

Show a confirmation dialog before adding/updating:

```
┌─────────────────────────────────┐
│  Add Stash Server?              │
│                                 │
│  Name: Home Stash               │
│  URL:  http://192.168.1.10:9999 │
│  API Key: ****...1234           │
│                                 │
│  [Cancel]        [Add Server]   │
└─────────────────────────────────┘

OR (if URL already exists):

┌─────────────────────────────────┐
│  Update Existing Server?        │
│                                 │
│  Name: Home Stash               │
│  URL:  http://192.168.1.10:9999 │
│  API Key: Updated               │
│                                 │
│  [Cancel]        [Update]       │
└─────────────────────────────────┘
```

## Security Considerations

- Validate URL format (must be `http://` or `https://`)
- Show masked API key in confirmation UI (last 4 chars only)
- The plugin already warns users and auto-hides the QR code after 60 seconds

## Existing Stow Models Reference

The `Server` model (`Stow/Models/Server.swift`):
- `id: UUID`
- `name: String`
- `url: String` (auto-cleaned, no trailing slash, no `/graphql`)
- `apiKey: String` (stored in Keychain via `KeychainManager`)
- `syncThumbnails: Bool` (default: `true`)
- `syncPreviews: Bool` (default: `false`)
- `syncFrequency: SyncFrequency` (default: `.always`)
- `isEnabled: Bool` (default: `true`)

## Testing

1. Open Stash → Settings → Security
2. Click "📱 Stow QR" button
3. Scan QR code with iPhone/iPad camera
4. Verify Stow app opens with confirmation dialog
5. Confirm adding server
6. Verify server appears in Stow's server list
7. Scan same QR again → verify update flow
8. Test with invalid/malformed QR data
