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

Share links encode media metadata in the URL fragment as base64-encoded JSON:

```
https://share.music-assistant.io/#<base64_payload>
```

Payload structure (TypeScript):

```typescript
interface SharePayload {
  type: "track" | "album" | "artist" | "playlist";
  title?: string;
  artist?: string;
  album?: string;
  art?: string;
  uri: string;  // MA internal URI (e.g., "library://track/123")
  links?: Record<ProviderDomain, string>;  // Quick links to providers
  tracks?: PlaylistTrack[];  // For playlist type only
}
```
