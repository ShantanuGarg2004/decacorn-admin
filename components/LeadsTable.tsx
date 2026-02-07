import { Lead } from "@/types/leads";

interface Props {
  leads: Lead[];
}

export default function LeadsTable({ leads }: Props) {
  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th>Service</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="border-t hover:bg-gray-50 transition duration-150"
            >
              <td className="p-4 font-medium text-gray-900">
                {lead.name}
              </td>
              <td>{lead.email}</td>
              <td>{lead.phone || "-"}</td>
              <td>{lead.company}</td>
              <td>{lead.service}</td>
              <td>
                {new Date(lead.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
