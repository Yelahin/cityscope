export interface FilterOption {
  id: number;
  name: string;
}

export interface Coordinates {
  latitude: number | null;
  longitude: number | null;
}

export interface ApiErrorResponse {
  detail?: string;
  message?: string | Record<string, string[]>;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
