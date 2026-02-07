"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LeadsTable from "@/components/LeadsTable";
import SearchBar from "@/components/SearchBar";
import StatsCard from "@/components/StatsCard";
import ExportButtons from "@/components/ExportButtons";
import { Lead } from "@/types/leads";

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching leads:", error);
      setLeads([]);
      setFilteredLeads([]);
    } else {
      const safeData: Lead[] = (data ?? []) as Lead[];
      setLeads(safeData);
      setFilteredLeads(safeData);
    }

    setLoading(false);
  };

  const handleSearch = (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      setFilteredLeads(leads);
      return;
    }

    const filtered = leads.filter((lead) => {
      const searchableContent = [
        lead.name,
        lead.email,
        lead.phone ?? "",
        lead.company,
        lead.service,
        lead.description ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(normalizedQuery);
    });

    setFilteredLeads(filtered);
  };

  // Stats calculations
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-10">
      <h1 className="text-3xl font-semibold tracking-tight mb-10">
        Decacorn Admin Dashboard
      </h1>

      {loading ? (
        <div className="text-gray-500">Loading leads...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatsCard title="Total Leads" value={totalLeads} />
            <StatsCard title="This Month" value={monthLeads} />
            <StatsCard title="This Week" value={weekLeads} />
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <SearchBar onSearch={handleSearch} />
            <ExportButtons data={filteredLeads} />
          </div>

          {/* Leads Table */}
          <LeadsTable leads={filteredLeads} />
        </>
      )}
    </div>
  );
}
