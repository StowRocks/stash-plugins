# Stow App: QR Code Server Setup Integration

## Objective
Implement `stow://` URL scheme handling to allow users to scan a QR code from the StowServerQR Stash plugin and automatically add/update server credentials in the Stow iOS/macOS app.

## Requirements

### 1. Register URL Scheme
Add to `Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>Stow Server Setup</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>stow</string>
    </array>
  </dict>
</array>
```

### 2. QR Code Data Format
The QR code contains JSON:
```json
{
  "name": "My Stash Server",
  "url": "http://192.168.1.10:9999",
  "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. URL Scheme Format
When iOS/macOS detects the QR code, it should trigger:
```
stow://add-server?data=<base64_encoded_json>
```

### 4. Implementation Requirements

**Handle URL in App:**
```swift
.onOpenURL { url in
    guard url.scheme == "stow",
          url.host == "add-server",
          let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
          let dataParam = components.queryItems?.first(where: { $0.name == "data" })?.value,
          let jsonData = Data(base64Encoded: dataParam),
          let serverInfo = try? JSONDecoder().decode(ServerInfo.self, from: jsonData)
    else { return }
    
    handleServerSetup(serverInfo)
}
```

**Logic:**
1. Parse base64-encoded JSON from URL
2. Check if server with same URL already exists
3. If exists: Show "Update Server?" dialog with changes highlighted
4. If new: Show "Add Server?" dialog with server details
5. On confirm: Save/update server credentials
6. Navigate to server or show success message

**UI Flow:**
```
Scan QR → iOS opens Stow app → Alert appears:

┌─────────────────────────────────┐
│  Add Stash Server?              │
│                                 │
│  Name: Home Stash               │
│  URL: http://192.168.1.10:9999  │
│  API Key: ****...1234           │
│                                 │
│  [Cancel]  [Add Server]         │
└─────────────────────────────────┘

OR (if URL exists):

┌─────────────────────────────────┐
│  Update Existing Server?        │
│                                 │
│  Server: Home Stash             │
│  URL: http://192.168.1.10:9999  │
│                                 │
│  Changes:                       │
│  • Name: "Old Name" → "Home..."│
│  • API Key: Updated             │
│                                 │
│  [Cancel]  [Update]             │
└─────────────────────────────────┘
```

### 5. Security Considerations
- Validate URL format (must be http:// or https://)
- Validate API key is not empty
- Show masked API key in UI (show last 4 chars only)
- Warn if replacing existing server
- Test connection before saving (optional but recommended)

### 6. Error Handling
- Invalid QR data → Show "Invalid QR code" alert
- Malformed JSON → Show "Could not read server data" alert
- Network unreachable → Show "Cannot connect to server" warning (but allow saving)

### 7. Testing
1. Generate QR code from Stash plugin
2. Scan with iPhone camera
3. Verify Stow app opens
4. Verify server details shown correctly
5. Test adding new server
6. Test updating existing server (scan same URL twice)
7. Test canceling
8. Test with invalid QR data

## Implementation Notes
- Use existing `ServerCredentials` model (or create if needed)
- Integrate with existing server management code
- Ensure persistence (UserDefaults/CoreData)
- Handle both iOS and macOS (camera vs manual URL entry)

## Alternative: Direct JSON in QR
If base64 encoding is problematic, the QR could contain the JSON directly:
```
stow://add-server?name=Home%20Stash&url=http://...&apiKey=...
```

But base64 is cleaner and handles special characters better.
