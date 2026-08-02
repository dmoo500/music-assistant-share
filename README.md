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

## Architecture

- **No WebSocket**: Static share link handler without live server connection
- **Vue 3 Composition API**: Modern reactive components with TypeScript
- **Vite**: Fast dev server and optimized production builds
- **TailwindCSS**: Utility-first styling matching MA design system
- **VueUse**: Composables for local storage and utilities
- **Auto Dark Mode**: Automatically follows system theme preference via `prefers-color-scheme`

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

When opening a share link in your Music Assistant instance:

1. **Tracks with ISRC**: Search using `isrc:{code}` pattern across all providers
2. **Artists with MBID**: Search using `mbid:{id}` pattern
3. **Fallback**: If no external ID available, search by title (+ artist if present)
4. **Playlists**: Server plugin resolves each track individually and creates new library playlist

**Note**: External ID lookup will be enhanced with dedicated API endpoints (PR #5110).

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
