"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

const STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

interface Lead {
  id: string;
  name: string;
  company: string;
  status: string;
  expected_value: number;
  probability: number;
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  const fetchLeads = async () => {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("archived", false);

    setLeads((data ?? []) as Lead[]);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateLeadStatus = async (
    leadId: string,
    newStatus: string
  ) => {
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

    fetchLeads();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as string;

    const lead = leads.find((l) => l.id === leadId);

    if (lead && lead.status !== newStatus) {
      updateLeadStatus(leadId, newStatus);
    }
  };

  const getWeightedValue = (lead: Lead) => {
    if (lead.status === "Won") {
      return lead.expected_value ?? 0;
    }

    return Math.round(
      (lead.expected_value ?? 0) *
        ((lead.probability ?? 0) / 100)
    );
  };

  const getColumnTotal = (status: string) => {
    return leads
      .filter((l) => l.status === status)
      .reduce(
        (sum, l) => sum + getWeightedValue(l),
        0
      );
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f5f7fa]">
      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        {/* Desktop View - Vertical Columns */}
        <div className="hidden md:grid md:grid-cols-7 gap-6 p-6 h-full">
          {STATUSES.map((status) => (
            <DroppableColumn
              key={status}
              status={status}
              leads={leads}
              getWeightedValue={getWeightedValue}
              getColumnTotal={getColumnTotal}
            />
          ))}
        </div>

        {/* Mobile View - Horizontal Scroll */}
        <div className="md:hidden">
          <div className="overflow-x-auto overflow-y-hidden h-[calc(100vh-80px)] px-4 py-6">
            <div className="flex gap-4 h-full" style={{ width: `${STATUSES.length * 280}px` }}>
              {STATUSES.map((status) => (
                <DroppableColumn
                  key={status}
                  status={status}
                  leads={leads}
                  getWeightedValue={getWeightedValue}
                  getColumnTotal={getColumnTotal}
                  mobile
                />
              ))}
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}

function DroppableColumn({
  status,
  leads,
  getWeightedValue,
  getColumnTotal,
  mobile = false,
}: {
  status: string;
  leads: Lead[];
  getWeightedValue: (lead: Lead) => number;
  getColumnTotal: (status: string) => number;
  mobile?: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-white rounded-2xl shadow-sm ${
        mobile ? "w-[260px] flex-shrink-0 h-full" : ""
      }`}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
        <div className="font-semibold text-sm text-gray-800">
          {status}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          ₹ {getColumnTotal(status).toLocaleString()}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {leads
          .filter((l) => l.status === status)
          .map((lead) => (
            <DraggableCard
              key={lead.id}
              lead={lead}
              weightedValue={getWeightedValue(lead)}
            />
          ))}
      </div>
    </div>
  );
}

function DraggableCard({
  lead,
  weightedValue,
}: {
  lead: Lead;
  weightedValue: number;
}) {
  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({
      id: lead.id,
    });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing border border-gray-100 touch-none"
    >
      <div className="text-sm font-medium text-gray-800">
        {lead.name}
      </div>

      <div className="text-xs text-gray-500 mt-1">
        {lead.company}
      </div>

      <div className="mt-3 text-xs font-semibold text-gray-700">
        ₹ {weightedValue.toLocaleString()}
      </div>
    </div>
  );
}