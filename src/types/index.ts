export interface Entry {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  excerpt: string | null;
  mood: number | null;
  location: string | null;
  ambientSound: string | null;
  weather: string | null;
  visibility: "private" | "public";
  status: "draft" | "published";
  entryDate: string;
  createdAt: string;
  updatedAt: string;
  images: EntryImage[];
  musicAnchors: MusicAnchor[];
}

export interface EntryImage {
  id: string;
  entryId: string;
  url: string;
  caption: string | null;
  order: number;
  width: number | null;
  height: number | null;
}

export interface MusicAnchor {
  id: string;
  entryId: string;
  trackName: string;
  artist: string | null;
  albumArtUrl: string | null;
  sourceUrl: string | null;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
}
