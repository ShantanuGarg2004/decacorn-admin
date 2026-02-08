"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lead } from "@/types/leads";

interface Props {
  lead: Lead | null;
  onClose: () => void;
  onRefresh: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const STATUS_OPTIONS = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

export default function LeadDrawer({
  lead,
  onClose,
  onRefresh,
}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");

  const [status, setStatus] = useState("New");
  const [expectedValue, setExpectedValue] = useState(0);
  const [probability, setProbability] = useState(0);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  /* ===============================
     FUNCTIONS (Defined First)
  =============================== */

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*");
    setUsers(data || []);
  };

  const fetchNotes = async () => {
    if (!lead) return;

    const { data } = await supabase
      .from("lead_notes")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false });

    setNotes(data || []);
  };

  const fetchActivities = async () => {
    if (!lead) return;

    const { data } = await supabase
      .from("lead_activity")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false });

    setActivities(data || []);
  };

  const saveLeadUpdates = async () => {
    if (!lead) return;

    const { error } = await supabase
      .from("leads")
      .update({
        status,
        expected_value: expectedValue,
        probability,
        owner_id: ownerId,
        last_activity: new Date().toISOString(),
      })
      .eq("id", lead.id);

    if (!error) {
      await supabase.from("lead_activity").insert({
        lead_id: lead.id,
        type: "lead_updated",
        description: "Lead updated",
      });

      onRefresh();
      fetchActivities();
    }
  };

  const addNote = async () => {
    if (!lead || !newNote.trim()) return;

    await supabase.from("lead_notes").insert({
      lead_id: lead.id,
      note: newNote,
    });

    await supabase.from("lead_activity").insert({
      lead_id: lead.id,
      type: "note_added",
      description: "Note added",
    });

    setNewNote("");
    fetchNotes();
    fetchActivities();
  };

  const archiveLead = async () => {
    if (!lead) return;

    await supabase
      .from("leads")
      .update({ archived: true })
      .eq("id", lead.id);

    await supabase.from("lead_activity").insert({
      lead_id: lead.id,
      type: "archived",
      description: "Lead archived",
    });

    onClose();
    onRefresh();
  };

  /* ===============================
     EFFECTS (After Functions)
  =============================== */

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status ?? "New");
      setExpectedValue(lead.expected_value ?? 0);
      setProbability(lead.probability ?? 0);
      setOwnerId(lead.owner_id ?? null);
      fetchNotes();
      fetchActivities();
    }
  }, [lead]);

  if (!lead) return null;

  const leadAge =
    Math.floor(
      (Date.now() - new Date(lead.created_at).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + " days";

  return (
    <div className="fixed inset-0 flex justify-end bg-black/20 z-50">
      <div className="w-full max-w-xl bg-white h-full shadow-xl p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {lead.name}
          </h2>
          <button onClick={onClose} className="text-sm text-gray-500">
            Close
          </button>
        </div>

        <div className="space-y-2 text-sm mb-6">
          <div><strong>Email:</strong> {lead.email}</div>
          <div><strong>Company:</strong> {lead.company}</div>
          <div><strong>Service:</strong> {lead.service}</div>
          <div><strong>Lead Age:</strong> {leadAge}</div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs text-gray-500">Owner</label>
            <select
              value={ownerId ?? ""}
              onChange={(e) =>
                setOwnerId(e.target.value || null)
              }
              className="w-full border rounded-lg p-2 mt-1"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={saveLeadUpdates}
            className="w-full py-2 bg-black text-white rounded-lg"
          >
            Save Changes
          </button>

          <button
            onClick={archiveLead}
            className="w-full py-2 bg-red-600 text-white rounded-lg"
          >
            Archive Lead
          </button>
        </div>
      </div>
    </div>
  );
}
