// Auth
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  dietary_restrictions: string[];
  cuisine_preferences: string[];
  budget_range: "$" | "$$" | "$$$" | "$$$$";
  max_distance_km: number;
}

// Restaurant
export interface Restaurant {
  id: string;
  google_place_id: string;
  name: string;
  cuisine_tags: string[];
  price_tier: "$" | "$$" | "$$$" | "$$$$" | null;
  rating: number | null;
  photo_url: string | null;
  address: string | null;
  lat: number;
  lng: number;
}

// Session — matches backend SessionOut schema
export interface Session {
  id: string;
  code: string;
  host_user_id: string;
  status: "lobby" | "swiping" | "results" | "matched";
  location_lat: number | null;
  location_lng: number | null;
  location_label: string | null;
  members: SessionMember[];
  matched_restaurant_id: string | null;
  created_at: string;
}

export interface SessionMember {
  user_id: string;
  name: string;
  joined_at: string;
}

// Swipe
export interface Swipe {
  id: string;
  user_id: string;
  session_id: string;
  restaurant_id: string;
  direction: "yes" | "no";
  created_at: string;
}

// Results — matches backend TopResult schema
export interface SessionResult {
  restaurant: Restaurant;
  score_pct: number;
  yes_count: number;
  total: number;
}

// WebSocket Events
export interface WSEvent<T = any> {
  type:
    | "member_joined"
    | "swipe_progress"
    | "instant_match"
    | "phase_change"
    | "top3_ready";
  payload: T;
}

export interface MemberJoinedPayload {
  user_id: string;
  name: string;
}

export interface SwipeProgressPayload {
  user_id: string;
  swipe_count: number;
}

export interface InstantMatchPayload {
  restaurant: Restaurant;
}

export interface PhaseChangePayload {
  phase: "swiping" | "results" | "matched";
}

export interface Top3ReadyPayload {
  results: SessionResult[];
}
