"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Lead {
  id: string;
  status: string;
  expected_value: number;
  probability: number;
  owner_id: string | null;
}

export default function ForecastPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("archived", false); // ✅ Important

    if (!error && data) {
      setLeads(data as Lead[]);
    }

    setLoading(false);
  };

  const weightedValue = (lead: Lead) => {
    if (lead.status === "Won") {
      return lead.expected_value ?? 0;
    }

    return Math.round(
      (lead.expected_value ?? 0) *
        ((lead.probability ?? 0) / 100)
    );
  };

  const weightedPipeline = leads
    .filter((l) => l.status !== "Won" && l.status !== "Lost")
    .reduce((sum, l) => sum + weightedValue(l), 0);

  const closedRevenue = leads
    .filter((l) => l.status === "Won")
    .reduce((sum, l) => sum + (l.expected_value ?? 0), 0);

  const totalClosed = leads.filter(
    (l) => l.status === "Won" || l.status === "Lost"
  ).length;

  const totalWon = leads.filter(
    (l) => l.status === "Won"
  ).length;

  const winRate =
    totalClosed === 0
      ? 0
      : Math.round((totalWon / totalClosed) * 100);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f5f7fa] p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8">
        Revenue Forecast
      </h1>

      {loading ? (
        <div>Loading forecast...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Weighted Pipeline"
            value={`₹ ${weightedPipeline.toLocaleString()}`}
          />
          <MetricCard
            title="Closed Revenue"
            value={`₹ ${closedRevenue.toLocaleString()}`}
          />
          <MetricCard
            title="Win Rate"
            value={`${winRate}%`}
          />
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="text-sm text-gray-500">
        {title}
      </div>
      <div className="text-xl font-semibold mt-2">
        {value}
      </div>
    </div>
  );
}
