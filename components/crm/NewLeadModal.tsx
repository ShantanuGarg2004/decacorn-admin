"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Modal from "./Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  users: any[];
}

export default function NewLeadModal({
  isOpen,
  onClose,
  onRefresh,
  users,
}: Props) {
  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    description: "",
    owner_id: "",
    expected_value: 0,
    probability: 0,
  });

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const createLead = async () => {
    const { data, error } = await supabase
      .from("leads")
      .insert({
        ...form,
        source: "manual",
        status: "New",
      })
      .select()
      .single();

    if (!error && data) {
      await supabase.from("lead_activity").insert({
        lead_id: data.id,
        type: "created",
        description: "Lead created manually",
      });

      onRefresh();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-6">
        Create New Lead
      </h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <input
          placeholder="Name"
          className="border p-2 rounded"
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <input
          placeholder="Email"
          className="border p-2 rounded"
          onChange={(e) => handleChange("email", e.target.value)}
        />
        <input
          placeholder="Phone"
          className="border p-2 rounded"
          onChange={(e) => handleChange("phone", e.target.value)}
        />
        <input
          placeholder="Company"
          className="border p-2 rounded"
          onChange={(e) => handleChange("company", e.target.value)}
        />
        <input
          placeholder="Service"
          className="border p-2 rounded"
          onChange={(e) => handleChange("service", e.target.value)}
        />

        <select
          className="border p-2 rounded"
          onChange={(e) => handleChange("owner_id", e.target.value)}
        >
          <option value="">Assign Owner</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Expected Value"
          className="border p-2 rounded"
          onChange={(e) =>
            handleChange("expected_value", Number(e.target.value))
          }
        />

        <input
          type="number"
          placeholder="Probability %"
          className="border p-2 rounded"
          onChange={(e) =>
            handleChange("probability", Number(e.target.value))
          }
        />
      </div>

      <textarea
        placeholder="Description"
        className="border p-2 rounded w-full mt-4"
        onChange={(e) =>
          handleChange("description", e.target.value)
        }
      />

      <button
        onClick={createLead}
        className="mt-6 w-full py-2 bg-black text-white rounded-lg"
      >
        Create Lead
      </button>
    </Modal>
  );
}
