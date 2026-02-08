"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Lead {
  id: string;
  name: string;
  company: string;
  status: string;
}

export default function ArchivedPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArchived = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("archived", true);

    if (!error && data) {
      setLeads(data as Lead[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const restoreLead = async (id: string) => {
    await supabase
      .from("leads")
      .update({ archived: false })
      .eq("id", id);

    fetchArchived();
  };

  const permanentlyDelete = async (id: string) => {
    const confirmDelete = confirm(
      "This will permanently delete the lead. Continue?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Delete failed. Check RLS policy.");
      return;
    }

    fetchArchived();
  };

  return (
    <div className="p-8 bg-[#f5f7fa] min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">
        Archived Leads
      </h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          {leads.length === 0 && (
            <div className="text-sm text-gray-500">
              No archived leads.
            </div>
          )}

          {leads.map((lead) => (
            <div
              key={lead.id}
              className="flex justify-between items-center border-b pb-3"
            >
              <div>
                <div className="font-medium">
                  {lead.name}
                </div>
                <div className="text-xs text-gray-500">
                  {lead.company}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => restoreLead(lead.id)}
                  className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-800 transition"
                >
                  Restore
                </button>

                <button
                  onClick={() =>
                    permanentlyDelete(lead.id)
                  }
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
