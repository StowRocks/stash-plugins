# StashPlugins Setup Complete ✅

## What's Been Created

### Repository Structure
```
~/Source/StashPlugins/
├── plugins/stowServerQR/     # Plugin files
├── build.js                  # Node.js build script
├── package.json              # Dependencies & scripts
├── vercel.json               # Vercel deployment config
└── README.md                 # Documentation
```

### DNS Configuration
- ✅ `plugins.stow.rocks` → `cname.vercel-dns.com`
- Cloudflare DNS record created

## Next Steps

### 1. Create GitHub Repository
```bash
cd ~/Source/StashPlugins
gh repo create StashPlugins --public --source=. --remote=origin
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to https://vercel.com/new
2. Import `StashPlugins` repository
3. Vercel auto-detects settings from `vercel.json`
4. Add custom domain: `plugins.stow.rocks`
5. Deploy!

### 3. Test Installation in Stash
1. Open Stash → Settings → Plugins → Available Plugins
2. Click "Add Source"
3. Enter: `https://plugins.stow.rocks/index.yml`
4. Click "Reload"
5. Install "StowServerQR"

### 4. Implement Stow App Integration
Add to Stow iOS/macOS app:

**Info.plist:**
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>stow</string>
    </array>
  </dict>
</array>
```

**Handle URL:**
```swift
.onOpenURL { url in
    if url.scheme == "stow", url.host == "add-server" {
        // Parse QR data and show add server dialog
    }
}
```

## Plugin Features

- ✅ Auto-detects server URL
- ✅ Fetches API key from Stash config
- ✅ Customizable server name
- ✅ Security warnings
- ✅ 60-second auto-hide timer
- ✅ QR code with JSON data

## Testing

Build locally:
```bash
cd ~/Source/StashPlugins
npm run build
# Output in _site/
```

## URLs

- Plugin feed: `https://plugins.stow.rocks/index.yml`
- Plugin zip: `https://plugins.stow.rocks/stowServerQR.zip`
- GitHub: (create repo)
- Vercel: (deploy)

---

Ready to push to GitHub and deploy! 🚀
