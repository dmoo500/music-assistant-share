"""Generate Music Assistant share links."""

from __future__ import annotations

import json
from base64 import urlsafe_b64encode
from typing import Literal, NotRequired, TypedDict


class PlaylistTrack(TypedDict):
    title: str
    artist: NotRequired[str]
    album: NotRequired[str]
    isrc: NotRequired[str]
    mbid: NotRequired[str]
    mb_track: NotRequired[str]
    duration: NotRequired[int]
    provider_refs: NotRequired[dict[str, str]]


class SharePayload(TypedDict):
    type: Literal["track", "album", "artist", "playlist"]
    title: str
    artist: NotRequired[str]
    album: NotRequired[str]
    isrc: NotRequired[str]
    mbid: NotRequired[str]
    mb_track: NotRequired[str]
    barcode: NotRequired[str]
    art_ref: NotRequired[str]
    provider_refs: NotRequired[dict[str, str]]
    tracks: NotRequired[list[PlaylistTrack]]


def create_share_link(
    payload: SharePayload,
    base_url: str = "https://share.music-assistant.io",
) -> str:
    """Encode a JSON payload as a base64url share link."""
    if not payload["title"].strip():
        raise ValueError("Payload must include a title")
    compact_json = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    encoded = urlsafe_b64encode(compact_json.encode("utf-8")).decode("ascii").rstrip("=")
    return f"{base_url}/#{encoded}"


if __name__ == "__main__":
    track: SharePayload = {
        "type": "track",
        "title": "A Better Believer",
        "artist": "Volbeat",
        "isrc": "DKNE11000108",
        "art_ref": "m:is1-ssl:/image/thumb/...",
        "provider_refs": {
            "apple_music": "/de/album/1440738335?i=1440738441",
            "spotify": "/track/3z8h0TU7ReDPLIbEnYhWZb",
        },
    }
    print(create_share_link(track))
