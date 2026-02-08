"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lead } from "@/types/leads";
import LeadsTable from "@/components/LeadsTable";
import SearchBar from "@/components/SearchBar";
import StatsCard from "@/components/StatsCard";
import ExportButtons from "@/components/ExportButtons";

const ITEMS_PER_PAGE = 8;

export default function DashboardPage() {
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("archived", false) // FIX
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLeads(data);
      setFilteredLeads(data);
    }

    setLoading(false);
  };

  const handleSearch = (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      setFilteredLeads(leads);
      setCurrentPage(1);
      return;
    }

    const filtered = leads.filter((lead) =>
      [
        lead.name,
        lead.email,
        lead.phone ?? "",
        lead.company,
        lead.service,
        lead.description ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );

    setFilteredLeads(filtered);
    setCurrentPage(1);
  };

  const now = new Date();

  const totalLeads = leads.length;

  const monthLeads = leads.filter((lead) => {
    const date = new Date(lead.created_at);
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  const weekLeads = leads.filter((lead) => {
    const date = new Date(lead.created_at);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
  }).length;

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);

  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl md:text-3xl font-semibold">
          Decacorn Admin Dashboard
        </h1>
      </div>

      {loading ? (
        <div>Loading leads...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard title="Total Leads" value={totalLeads} />
            <StatsCard title="This Month" value={monthLeads} />
            <StatsCard title="This Week" value={weekLeads} />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <SearchBar onSearch={handleSearch} />
            <ExportButtons data={filteredLeads} />
          </div>

          <div className="overflow-x-auto">
            <LeadsTable leads={paginatedLeads} />
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6 flex-wrap">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
