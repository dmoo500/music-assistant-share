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

All implementations provide `createShareLink(payload)`. The payload includes
a media type and title and is encoded as Base64url JSON without a version field. Provider links are relative
`provider_refs`; artwork uses a compact `art_ref` host code and path. Full URLs,
and Music Assistant item URIs are not part of the wire format.

See the individual files for detailed examples and documentation.
