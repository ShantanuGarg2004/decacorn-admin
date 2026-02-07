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
    const { data, error } = await supabase
      .from("leads")
      .select("*")
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

  // Stats
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

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);

  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 md:p-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Decacorn Admin Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <div>Loading leads...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard title="Total Leads" value={totalLeads} />
            <StatsCard title="This Month" value={monthLeads} />
            <StatsCard title="This Week" value={weekLeads} />
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <SearchBar onSearch={handleSearch} />
            <ExportButtons data={filteredLeads} />
          </div>

          {/* Table */}
          <LeadsTable leads={paginatedLeads} />

          {/* Pagination Controls */}
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
