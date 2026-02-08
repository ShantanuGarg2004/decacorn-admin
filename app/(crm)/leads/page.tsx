"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lead } from "@/types/leads";
import Modal from "@/components/crm/Modal";
import NewLeadModal from "@/components/crm/NewLeadModal";
import LeadDetailsContent from "@/components/crm/LeadDetailsContent";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("All");

  const [users, setUsers] = useState<any[]>([]);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  /* ========================= */
  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*");
    setUsers(data || []);
  };

  const fetchLeads = async () => {
    setLoading(true);

    let query = supabase
      .from("leads")
      .select("*", { count: "exact" })
      .eq("archived", false)
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (statusFilter !== "All") {
      query = query.eq("status", statusFilter);
    }

    const { data, count } = await query;

    setLeads((data ?? []) as Lead[]);
    setTotalCount(count ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  /* ========================= */
  const updateStatus = async (leadId: string, newStatus: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    let updatePayload: any = {
      status: newStatus,
      last_activity: new Date().toISOString(),
    };

    if (newStatus === "Won") {
      updatePayload.probability = 100;
    }

    await supabase
      .from("leads")
      .update(updatePayload)
      .eq("id", leadId);

    await supabase.from("lead_activity").insert({
      lead_id: leadId,
      type: "status_change",
      description: `Status updated to ${newStatus}`,
    });

    fetchLeads();
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Won":
        return "bg-green-100 text-green-800";
      case "Lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="px-3 py-2 border rounded-lg bg-white text-sm md:text-base"
        >
          <option value="All">All Status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>

        <button
          onClick={() => setNewLeadOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm md:text-base whitespace-nowrap"
        >
          + New Lead
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Revenue</th>
                  <th>Probability</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => {
                  const owner = users.find(
                    (u) => u.id === lead.owner_id
                  );

                  const weightedValue =
                    lead.status === "Won"
                      ? lead.expected_value ?? 0
                      : Math.round(
                          (lead.expected_value ?? 0) *
                            ((lead.probability ?? 0) / 100)
                        );

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="p-4 font-medium">
                        {lead.name}
                      </td>
                      <td>{lead.company}</td>

                      <td>
                        <select
                          value={lead.status ?? "New"}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            updateStatus(lead.id, e.target.value)
                          }
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            lead.status
                          )}`}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </td>

                      <td>
                        {owner ? owner.name : "Unassigned"}
                      </td>

                      <td>₹ {weightedValue}</td>

                      <td>
                        {lead.status === "Won"
                          ? "-"
                          : `${lead.probability ?? 0}%`}
                      </td>

                      <td>
                        {new Date(
                          lead.created_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-6 bg-white rounded-xl">Loading...</div>
        ) : (
          leads.map((lead) => {
            const owner = users.find(
              (u) => u.id === lead.owner_id
            );

            const weightedValue =
              lead.status === "Won"
                ? lead.expected_value ?? 0
                : Math.round(
                    (lead.expected_value ?? 0) *
                      ((lead.probability ?? 0) / 100)
                  );

            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 active:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-base">
                      {lead.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {lead.company}
                    </div>
                  </div>
                  <select
                    value={lead.status ?? "New"}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      updateStatus(lead.id, e.target.value)
                    }
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      lead.status
                    )}`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">Owner</div>
                    <div className="font-medium">
                      {owner ? owner.name : "Unassigned"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Revenue</div>
                    <div className="font-medium">₹ {weightedValue}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Probability</div>
                    <div className="font-medium">
                      {lead.status === "Won"
                        ? "-"
                        : `${lead.probability ?? 0}%`}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Created</div>
                    <div className="font-medium">
                      {new Date(
                        lead.created_at
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 md:gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm md:text-base">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      <NewLeadModal
        isOpen={newLeadOpen}
        onClose={() => setNewLeadOpen(false)}
        onRefresh={fetchLeads}
        users={users}
      />

      <Modal
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      >
        {selectedLead && (
          <LeadDetailsContent
            lead={selectedLead}
            users={users}
            onClose={() => setSelectedLead(null)}
            onRefresh={fetchLeads}
          />
        )}
      </Modal>
    </div>
  );
}