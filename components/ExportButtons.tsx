"use client";

import { Lead } from "@/types/leads";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  data: Lead[];
}

export default function ExportButtons({ data }: Props) {
  const exportCSV = () => {
    if (!data.length) return;

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Company",
      "Service",
      "Date",
    ];

    const rows = data.map((lead) => [
      lead.name,
      lead.email,
      lead.phone || "-",
      lead.company,
      lead.service,
      new Date(lead.created_at).toLocaleString(),
    ]);

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "decacorn-leads.csv";
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const exportDate = new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text("Decacorn Labs – Leads Report", 14, 20);

    doc.setFontSize(10);
    doc.text(`Exported on: ${exportDate}`, 14, 28);

    const tableData = data.map((lead) => [
      lead.name,
      lead.email,
      lead.phone || "-",
      lead.company,
      lead.service,
      new Date(lead.created_at).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["Name", "Email", "Phone", "Company", "Service", "Date"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0] },
    });

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      "Confidential – Decacorn Labs",
      105,
      290,
      { align: "center" }
    );

    doc.save("decacorn-leads-report.pdf");
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={exportCSV}
        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition duration-200 shadow-sm"
      >
        Export CSV
      </button>

      <button
        onClick={exportPDF}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm"
      >
        Export PDF
      </button>
    </div>
  );
}
