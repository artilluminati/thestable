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

export interface NoteSummary {
  path: string;
  title: string;
  updated_at: string;
}

export interface Note extends NoteSummary {
  content: string;
  outbound_links: string[];
}

export interface Reminder {
  path: string;
  title: string;
  // Shape depends on schedule.type - see lib/reminder-schedule.ts for how
  // each type (once/daily/weekly/monthly/interval) is read and formatted.
  schedule: Record<string, unknown>;
}
