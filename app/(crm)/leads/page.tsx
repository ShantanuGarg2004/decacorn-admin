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

  /* =========================
     FETCH USERS
  ========================= */

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*");
    setUsers(data || []);
  };

  /* =========================
     FETCH LEADS
  ========================= */

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

  /* =========================
     UPDATE STATUS
  ========================= */

  const updateStatus = async (leadId: string, newStatus: string) => {
    await supabase
      .from("leads")
      .update({
        status: newStatus,
        last_activity: new Date().toISOString(),
      })
      .eq("id", leadId);

    await supabase.from("lead_activity").insert({
      lead_id: leadId,
      type: "status_change",
      description: `Status updated to ${newStatus}`,
    });

    fetchLeads();
  };

  /* =========================
     STATUS COLOR
  ========================= */

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "New":
        return "bg-gray-200 text-gray-800";
      case "Contacted":
        return "bg-blue-100 text-blue-800";
      case "Qualified":
        return "bg-purple-100 text-purple-800";
      case "Proposal Sent":
        return "bg-yellow-100 text-yellow-800";
      case "Negotiation":
        return "bg-orange-100 text-orange-800";
      case "Won":
        return "bg-green-100 text-green-800";
      case "Lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="space-y-6">
      {/* Filters + New Lead */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="px-3 py-2 border rounded-lg bg-white"
        >
          <option value="All">All Status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>

        <button
          onClick={() => setNewLeadOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          + New Lead
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th>Company</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Value</th>
                <th>Probability</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => {
                const owner = users.find(
                  (u) => u.id === lead.owner_id
                );

                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="border-t hover:bg-gray-50 transition cursor-pointer"
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

                    <td>₹ {lead.expected_value ?? 0}</td>

                    <td>{lead.probability ?? 0}%</td>

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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* New Lead Modal */}
      <NewLeadModal
        isOpen={newLeadOpen}
        onClose={() => setNewLeadOpen(false)}
        onRefresh={fetchLeads}
        users={users}
      />

      {/* Lead Details Modal */}
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
