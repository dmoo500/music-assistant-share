# Share Link Generation Examples

This directory contains example implementations for generating Music Assistant share links in different languages.

## Python

```bash
python examples/generate_share_link.py
```

Creates share links using Python's standard library. Includes helper functions for each media type.

## JavaScript

```bash
node examples/generate_share_link.js
```

Browser-compatible JavaScript with ES module exports. Works in Node.js and browsers.

## TypeScript

```bash
npx tsx examples/generate_share_link.ts
```

Type-safe implementation with full TypeScript definitions. Can be used directly in TypeScript projects.

## Usage

All implementations provide the same core functions:

- `createShareLink(payload)` - Generic function with full payload control
- `createTrackShareLink(uri, options)` - Helper for tracks
- `createAlbumShareLink(uri, options)` - Helper for albums
- `createArtistShareLink(uri, options)` - Helper for artists
- `createPlaylistShareLink(uri, options)` - Helper for playlists

See the individual files for detailed examples and documentation.
