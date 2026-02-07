import { Lead } from "@/types/leads";

interface Props {
  leads: Lead[];
}

export default function LeadsTable({ leads }: Props) {
  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
      
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
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
                className="border-t hover:bg-gray-50 transition"
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

      {/* Mobile Card View */}
      <div className="md:hidden divide-y">
        {leads.map((lead) => (
          <div key={lead.id} className="p-4 space-y-2">
            <div className="font-semibold text-gray-900">
              {lead.name}
            </div>

            <div className="text-sm text-gray-600">
              <strong>Email:</strong> {lead.email}
            </div>

            <div className="text-sm text-gray-600">
              <strong>Phone:</strong> {lead.phone || "-"}
            </div>

            <div className="text-sm text-gray-600">
              <strong>Company:</strong> {lead.company}
            </div>

            <div className="text-sm text-gray-600">
              <strong>Service:</strong> {lead.service}
            </div>

            <div className="text-xs text-gray-400">
              {new Date(lead.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
