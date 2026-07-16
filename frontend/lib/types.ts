export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface ShortUrl {
  id: number;
  original_url: string;
  short_code: string;
  clicks: number;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}
