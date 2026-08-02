"""
Music Assistant Share Link Generator

Creates shareable links for Music Assistant media items.
Links encode metadata as base64url JSON in the URL fragment.
"""

import json
from base64 import urlsafe_b64encode
from typing import Any, Literal, TypedDict


class PlaylistTrack(TypedDict, total=False):
    """Track information for playlists."""

    title: str
    artist: str
    isrc: str


class SharePayload(TypedDict, total=False):
    """Share link payload structure (matches server plugin format)."""

    v: int  # Format version (always 1)
    type: Literal["track", "artist", "playlist"]
    title: str  # Required
    artist: str
    album: str  # For tracks only
    art: str
    isrc: str  # For tracks
    mbid: str  # For artists (MusicBrainz ID)
    links: dict[str, str]  # Provider quick links
    tracks: list[PlaylistTrack]  # For playlists only


def create_share_link(
    payload: SharePayload,
    base_url: str = "https://share.music-assistant.io",
) -> str:
    """
    Create a shareable link from a payload.

    :param payload: Media metadata to encode
    :param base_url: Share handler base URL
    :return: Complete shareable URL
    """
    # Ensure required fields
    if "type" not in payload or "uri" not in payload:
        raise ValueError("Payload must contain 'type' and 'uri' fields")

    # Compact JSON (no whitespace)
    json_str = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)

    # URL-safe base64 without padding
    encoded = urlsafe_b64encode(json_str.encode("utf-8")).decode("ascii")
    encoded = encoded.rstrip("=")

    return f"{base_url}/#{encoded}"


def create_track_share_link(
    title: str,
    artist: str | None = None,
    album: str | None = None,
    isrc: str | None = None,
    art_url: str | None = None,
    provider_links: dict[str, str] | None = None,
) -> str:
    """
    Create a shareable link for a track.

    :param title: Track title (required)
    :param artist: Artist name
    :param album: Album name
    :param isrc: ISRC code for precise lookup
    :param art_url: Album art URL
    :param provider_links: Dict of provider links (e.g., {"spotify": "https://..."})
    :return: Shareable URL
    """
    payload: SharePayload = {"v": 1, "type": "track", "title": title}

    if artist:
        payload["artist"] = artist
    if album:
        payload["album"] = album
    if isrc:
        payload["isrc"] = isrc
    if art_url:
        payload["art"] = art_url
    if provider_links:
        payload["links"] = provider_links

    return create_share_link(payload)


def create_artist_share_link(
    title: str,
    mbid: str | None = None,
    art_url: str | None = None,
    provider_links: dict[str, str] | None = None,
) -> str:
    """
    Create a shareable link for an artist.

    :param title: Artist name (required)
    :param mbid: MusicBrainz ID for precise lookup
    :param art_url: Artist image URL
    :param provider_links: Dict of provider links (e.g., {"spotify": "https://..."})
    :return: Shareable URL
    """
    payload: SharePayload = {"v": 1, "type": "artist", "title": title}

    if mbid:
        payload["mbid"] = mbid
    if art_url:
        payload["art"] = art_url
    if provider_links:
        payload["links"] = provider_links

    return create_share_link(payload)


def create_playlist_share_link(
    title: str,
    tracks: list[PlaylistTrack] | None = None,
    art_url: str | None = None,
    provider_links: dict[str, str] | None = None,
) -> str:
    """
    Create a shareable link for a playlist.

    :param title: Playlist name (required)
    :param tracks: List of tracks with title, artist, and optional ISRC
    :param art_url: Playlist cover art URL
    :param provider_links: Dict of provider links
    :return: Shareable URL
    """
    payload: SharePayload = {"v": 1, "type": "playlist", "title": title}

    if tracks:
        payload["tracks"] = tracks
    if art_url:
        payload["art"] = art_url
    if provider_links:
        payload["links"] = provider_links

    return create_share_link(payload)
    tracks: list[PlaylistTrack] | None = None,
    provider_links: dict[str, str] | None = None,


# Example usage
if __name__ == "__main__":
    # Track example with ISRC
    track_link = create_track_share_link(
        title="Come Softly To Me",
        artist="The Fleetwoods",
        album="Come Softly to Me: The Very Best of the Fleetwoods",
        isrc="USCA20400333",
        art_url="https://picsum.photos/seed/fleetwoods/80",
        provider_links={
            "spotify": "https://open.spotify.com/track/3z8h0TU7ReDPLIbEnYhWZb",
            "tidal": "https://tidal.com/browse/track/5250269",
        },
    )
    print(f"Track: {track_link}")

    # Artist example with MusicBrainz ID
    artist_link = create_artist_share_link(
        title="Queen",
        mbid="0383dadf-2a4e-4d10-a46a-e9e041da8eb3",
        provider_links={
            "spotify": "https://open.spotify.com/artist/1dfeR4HaWDbWqFHLkxsg1d",
        },
    )
    print(f"Artist: {artist_link}")

    # Playlist example
    playlist_link = create_playlist_share_link(
        title="My Favorites",
        tracks=[
            {"title": "Bohemian Rhapsody", "artist": "Queen", "isrc": "GBUM71029604"},
            {"title": "Stairway to Heaven", "artist": "Led Zeppelin"},
        ],
    )
    print(f"Playlist: {playlist_link}")

