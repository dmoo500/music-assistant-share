# Music Assistant Share

Music Assistant share link handler - open shared tracks, albums, artists and playlists in your own Music Assistant instance.

Built with **Vue 3 + Vite + TypeScript + TailwindCSS** to match the Music Assistant frontend tech stack.

## Development

```bash
# Install dependencies
pnpm install

# Run dev server (http://localhost:3100)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## How It Works

1. **Decode**: Share link payload is decoded from base64url JSON
2. **Display**: Show track/artist/playlist preview with metadata and provider links
3. **Open**: When clicking "Open in Music Assistant":
   - **Primary**: POST to `/api/share/resolve` on your MA instance
     - Server-side resolution via Share Plugin
     - External ID lookup → search fallback
     - Returns resolved MA item
     - Navigate directly to item detail page
   - **Fallback**: If Share Plugin unavailable (older MA versions)
     - Navigate to search page with ISRC/MBID or title query
     - Manual selection of correct result

**Benefits of server-side resolution:**
- ✅ External ID API for precise, fast lookups (PR #5110)
- ✅ Automatic fallback to search when needed
- ✅ Playlist support (resolves all tracks and creates library playlist)
- ✅ No client-side provider API calls

## Architecture

- **Server-first Resolution**: Calls MA Share Plugin HTTP endpoint for smart resolution
- **Vue 3 Composition API**: Modern reactive components with TypeScript
- **Vite**: Fast dev server and optimized production builds
- **TailwindCSS**: Utility-first styling matching MA design system
- **VueUse**: Composables for local storage and utilities
- **Auto Dark Mode**: Automatically follows system theme preference via `prefers-color-scheme`
- **Provider Icons**: Official SVG icons from Music Assistant provider manifests (in `public/provider-icons/`)

## Project Structure

```
src/
├── components/          # Vue components
│   ├── MediaPreview.vue    # Album art + title/artist display
│   ├── ProviderLinks.vue   # Streaming service quick links
│   └── TrackList.vue       # Playlist track listing
├── constants.ts         # Provider metadata, colors, icons
├── types.ts            # TypeScript interfaces
├── style.css           # Global styles + CSS variables
├── App.vue             # Main component
└── main.ts             # Vue app entry point
```

## Share Link Format

Share links encode media metadata in the URL fragment as **base64url-encoded JSON** (URL-safe base64 without padding).

### URL Structure

```
https://share.music-assistant.io/#<base64url_payload>
```

Example:
```
https://share.music-assistant.io/#eyJ0eXBlIjoidHJhY2siLCJ0aXRsZSI6IkJvaGVtaWFuIFJoYXBzb2R5IiwiYXJ0aXN0IjoiUXVlZW4iLCJ1cmkiOiJsaWJyYXJ5Oi8vdHJhY2svMTIzIn0
```

### Payload Structure

The payload is a JSON object matching the Music Assistant server share plugin format:

```typescript
interface SharePayload {
  /** Format version (always 1) */
  v: number;
  
  /** Media type */
  type: "track" | "artist" | "playlist";
  
  /** Display title (required) */
  title: string;
  
  /** Display metadata */
  artist?: string;
  album?: string;  // For tracks only
  art?: string;    // Album art URL (optional)
  
  /** External IDs (provider-agnostic identifiers) */
  isrc?: string;  // For tracks - International Standard Recording Code
                  // Example: "USCA20400333"
  
  mbid?: string;  // For artists - MusicBrainz ID
                  // Example: "0383dadf-2a4e-4d10-a46a-e9e041da8eb3" (Queen)
  
  /** Provider quick links (optional, enriched by server) */
  links?: Record<ProviderDomain, string>;
  // Example: { "spotify": "https://open.spotify.com/track/...",
  //            "tidal": "https://tidal.com/browse/track/..." }
  
  /** Playlist tracks (only for type: "playlist") */
  tracks?: Array<{
    title: string;
    artist?: string;
    isrc?: string;
  }>;
}

type ProviderDomain = "spotify" | "tidal" | "qobuz" | "ytmusic" | "deezer" | "apple_music";
```

### Why External IDs?

Music Assistant uses **provider-agnostic identifiers** for sharing:

- **ISRC** (tracks): Global standard identifier, works across all streaming services
- **MusicBrainz ID** (artists): Open music encyclopedia unique identifier

This means:
- ✅ Share links work regardless of which providers sender/receiver use
- ✅ Your MA instance finds tracks/artists using ISRC/MBID search across all configured providers
- ✅ No dependency on specific provider availability
- ✅ Future-proof: new providers automatically supported

### Resolution Strategy

The **Music Assistant Share Plugin** on the server resolves share links intelligently:

1. **Primary: External ID Lookup** (when available)
   - Tracks: Try ISRC via dedicated external ID API (PR #5110)
   - Artists: Try MusicBrainz ID via external ID API
   - Precise, fast, and provider-agnostic

2. **Fallback: Search**
   - If external ID lookup fails or returns no results
   - Tracks: Search `isrc:{code}` or `{artist} {title}`
   - Artists: Search by name
   - Ensures compatibility even without external IDs

3. **Playlists**
   - Resolve each track individually (ISRC → title search)
   - Create new library playlist with matched tracks

**Benefits:**
- ✅ Best-effort resolution: tries precise lookup first, falls back to fuzzy search
- ✅ Works even when external IDs missing or providers don't support them
- ✅ Server-side: no client-side API calls needed

### Creating Share Links

See the [`examples/`](examples/) directory for complete implementations in:
- **Python** (`generate_share_link.py`) - Server-side generation
- **JavaScript** (`generate_share_link.js`) - Browser/Node.js compatible
- **TypeScript** (`generate_share_link.ts`) - Type-safe implementation

**Quick Python example:**

```python
import json
import base64

def create_share_link(payload: dict) -> str:
    # Ensure version is set
    if 'v' not in payload:
        payload['v'] = 1
    
    json_str = json.dumps(payload, separators=(',', ':'), ensure_ascii=False)
    b64 = base64.urlsafe_b64encode(json_str.encode('utf-8')).decode('ascii')
    b64 = b64.rstrip('=')  # Remove padding
    return f"https://share.music-assistant.io/#{b64}"

# Track example with ISRC
payload = {
    "v": 1,
    "type": "track",
    "title": "Come Softly To Me",
    "artist": "The Fleetwoods",
    "album": "Come Softly to Me: The Very Best of the Fleetwoods",
    "isrc": "USCA20400333",
    "art": "https://picsum.photos/seed/fleetwoods/80",
    "links": {
        "spotify": "https://open.spotify.com/track/3z8h0TU7ReDPLIbEnYhWZb"
    }
}
link = create_share_link(payload)
```

**Client-side generation** (JavaScript):

```javascript
function createShareLink(payload) {
    const json = JSON.stringify(payload);
    const b64 = btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    return `https://share.music-assistant.io/#${b64}`;
}
```

### Design Principles

1. **Compact**: Only essential data, short URIs instead of full URLs
2. **Self-contained**: All display data embedded (works offline)
3. **Provider-agnostic**: Works with any MA provider via URI scheme
4. **Progressive**: Optional features (art, links, tracks) only when available
