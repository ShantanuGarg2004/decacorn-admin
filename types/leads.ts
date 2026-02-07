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
}
