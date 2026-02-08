export interface Lead {
  id: string;

  name: string;
  email: string;
  phone: string | null;

  company: string;
  company_domain: string | null;
  service: string;
  description: string | null;

  created_at: string;

  // 🔥 LMS Fields
  status: string;
  owner_id: string | null;
  archived: boolean;
  expected_value: number | null;
  probability: number | null;
  last_activity: string | null;
}
