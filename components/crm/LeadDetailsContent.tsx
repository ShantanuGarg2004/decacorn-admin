"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lead } from "@/types/leads";

interface Props {
  lead: Lead;
  users: any[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function LeadDetailsContent({
  lead,
  users,
  onClose,
  onRefresh,
}: Props) {
  const [ownerId, setOwnerId] = useState<string | null>(
    lead.owner_id ?? null
  );
  const [expectedValue, setExpectedValue] = useState<number>(
    lead.expected_value ?? 0
  );
  const [probability, setProbability] = useState<number>(
    lead.probability ?? 0
  );
  const [status, setStatus] = useState<string>(
    lead.status ?? "New"
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setOwnerId(lead.owner_id ?? null);
    setExpectedValue(lead.expected_value ?? 0);
    setProbability(lead.probability ?? 0);
    setStatus(lead.status ?? "New");
  }, [lead]);

  const weightedValue =
    status === "Won"
      ? expectedValue
      : Math.round(expectedValue * (probability / 100));

  /* =========================
     SAVE CHANGES
  ========================= */

  const saveChanges = async () => {
    setSaving(true);

    let finalProbability = probability;

    if (status === "Won") {
      finalProbability = 100;
    }

    await supabase
      .from("leads")
      .update({
        owner_id: ownerId,
        expected_value: expectedValue,
        probability: finalProbability,
        status,
        last_activity: new Date().toISOString(),
      })
      .eq("id", lead.id);

    await supabase.from("lead_activity").insert({
      lead_id: lead.id,
      type: "lead_updated",
      description:
        "Lead updated (value / probability / owner / status)",
    });

    setSaving(false);
    onRefresh();
    onClose();
  };

  /* =========================
     ARCHIVE LEAD
  ========================= */

  const archiveLead = async () => {
    const confirmArchive = confirm(
      "Are you sure you want to archive this lead?"
    );

    if (!confirmArchive) return;

    await supabase
      .from("leads")
      .update({
        archived: true,
        last_activity: new Date().toISOString(),
      })
      .eq("id", lead.id);

    await supabase.from("lead_activity").insert({
      lead_id: lead.id,
      type: "archived",
      description: "Lead archived",
    });

    onRefresh();
    onClose();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          {lead.name}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Created:{" "}
          {new Date(lead.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-4 text-sm">

        <div>
          <strong>Email:</strong> {lead.email}
        </div>

        <div>
          <strong>Company:</strong> {lead.company}
        </div>

        <div>
          <strong>Service:</strong> {lead.service}
        </div>

        {/* STATUS */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-black outline-none"
          >
            <option>New</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Proposal Sent</option>
            <option>Negotiation</option>
            <option>Won</option>
            <option>Lost</option>
          </select>
        </div>

        {/* OWNER */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Owner
          </label>
          <select
            value={ownerId ?? ""}
            onChange={(e) =>
              setOwnerId(e.target.value || null)
            }
            className="w-full border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-black outline-none"
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* EXPECTED VALUE */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Expected Value (₹)
          </label>
          <input
            type="number"
            value={expectedValue}
            onChange={(e) =>
              setExpectedValue(Number(e.target.value))
            }
            className="w-full border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        {/* PROBABILITY */}
        {status !== "Won" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Probability (%)
            </label>
            <input
              type="number"
              value={probability}
              onChange={(e) =>
                setProbability(Number(e.target.value))
              }
              className="w-full border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-black outline-none"
              min={0}
              max={100}
            />
          </div>
        )}

        {/* WEIGHTED DISPLAY */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
          <strong>
            {status === "Won"
              ? "Final Revenue"
              : "Weighted Forecast"}
          </strong>
          : ₹ {weightedValue.toLocaleString()}
        </div>

        {/* ACTIONS */}
        <div className="pt-4 space-y-3">

          <button
            onClick={saveChanges}
            disabled={saving}
            className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={archiveLead}
            className="w-full py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            Archive Lead
          </button>
        </div>
      </div>
    </div>
  );
}
