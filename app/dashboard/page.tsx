"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  created_at: string;
};

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setLeads(data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Decacorn – Incoming Requests
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-white/10 rounded-xl overflow-hidden">
          <thead className="bg-white/5 text-sm text-white/70">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Service</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-t border-white/10 text-sm"
              >
                <td className="p-4">{lead.name}</td>
                <td>{lead.email}</td>
                <td>{lead.phone}</td>
                <td>{lead.company}</td>
                <td>{lead.service}</td>
                <td>
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
