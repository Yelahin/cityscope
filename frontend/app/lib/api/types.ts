export interface Place {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  latitude: number;
  longitude: number;
  rating: number | null;
  price_level: string | null;
  opening_status: "OPEN" | "CLOSED" | null;
  category: { id: number; name: string };
  city: { id: number; name: string };
  sourcerecord: number;
  distance?: number;
  is_favorite: boolean;
}

export interface User {
  username: string;
  email: string;
}

export interface SavedSearch {
  id: number;
  name: string;
  params: Record<string, unknown> | string;
}
