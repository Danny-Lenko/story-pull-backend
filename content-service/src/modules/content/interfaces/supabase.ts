export interface SupabaseUser {
  aud: string; // Audience
  exp: number; // Expiration time
  sub: string; // Subject (user ID)
  email: string; // User's email
  phone: string; // User's phone
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: {
    [key: string]: unknown; // Custom user metadata
  };
  role?: string; // User role if configured
  aal?: string; // Advanced Access Level
  session_id?: string;
}
