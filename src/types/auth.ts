export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface AuthStateResponse {
  configured: boolean;
  user: AuthUser | null;
}

export interface UserTravelData {
  savedProvinces: string[];
  visitedProvinces: string[];
  aiChats: Record<string, unknown[]>;
  itineraries: unknown[];
}
